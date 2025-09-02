import * as Sentry from "@sentry/nextjs";
import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import PurchaseNotificationEmail from "@/emails/purchase-notification";
import { createDefaultApiRouteContext } from "@/lib/createDefaultApiRouteContext";
import { parsePositiveInteger } from "@/lib/utils";
import { formatEmptyEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { config } from "~/config";
import { db } from "~/db";
import { users } from "~/db/schema";
import { logger } from "~/lib/logger";
import { resend } from "~/lib/resend";
import { stripe } from "~/lib/stripe";

export async function POST(request: Request) {
  const context = {
    ...(await createDefaultApiRouteContext(request)),
  };

  try {
    const signature = (await headers()).get("stripe-signature");

    if (!signature) {
      return NextResponse.json(formatErrorEntity("No signature provided"), {
        status: 400,
      });
    }

    const body = await request.text();

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SIGNING_SECRET as string
    );

    logger.info({ ...context, eventType: event.type }, "Webhook received");

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.created"
    ) {
      await db
        .update(users)
        .set({
          minutes: config.startingFreeMinutes,
        })
        .where(eq(users.stripeCustomerId, event.data.object.customer as string));
    } else if (event.type === "customer.subscription.deleted") {
    } else if (event.type === "checkout.session.completed") {
      const checkoutSessionId = event.data.object.id as Stripe.Checkout.Session["id"];

      const lineItems = await stripe.checkout.sessions.listLineItems(checkoutSessionId, {
        expand: ["data.price.product"],
      });

      logger.info({ ...context, lineItems, checkoutSessionId }, "Checkout session completed");

      let customerId = event.data.object.customer as string;
      const email = event.data.object.customer_details?.email || "";
      const customerName = event.data.object.customer_details?.name || "Customer";

      logger.info({ ...context, customerId, email }, "Customer details");

      if (!customerId) {
        const customer = await stripe.customers.create({
          email,
        });

        customerId = customer.id;

        await db
          .update(users)
          .set({
            stripeCustomerId: customerId,
          })
          .where(eq(users.email, email));
      }

      const minutes = lineItems.data.reduce((acc, lineItem) => {
        const minutesString = (lineItem.price?.product as Stripe.Product)?.metadata.minutes;

        if (!minutesString) {
          logger.warn({ lineItem }, "No minutes metadata found for line item");
          return acc;
        }

        let minutes: number;
        try {
          minutes = parsePositiveInteger(minutesString, "minutes", false);
        } catch (error) {
          logger.error({ minutesString, error }, "Failed to parse minutes from metadata");
          return acc;
        }

        const quantity = lineItem.quantity || 0;
        return acc + minutes * quantity;
      }, 0);

      const amountPaid = event.data.object.amount_total ? event.data.object.amount_total / 100 : 0; // Convert from cents to dollars

      const [user] = await db
        .update(users)
        .set({
          minutes: sql`${users.minutes} + ${minutes}`,
          stripeCustomerId: customerId,
        })
        .where(eq(users.stripeCustomerId, customerId))
        .returning();

      logger.info({ ...context, minutes, user }, "Minutes added");

      try {
        await resend.emails.send({
          from: `${config.projectName} Team <notifications@${config.domain}>`,
          to: config.supportEmail,
          subject: `New Purchase - ${customerName} bought ${minutes} minutes`,
          react: PurchaseNotificationEmail({
            customerName,
            minutesPurchased: minutes,
            amountPaid,
            currency: event.data.object.currency?.toUpperCase() || "USD",
            purchaseDate: new Date().toLocaleString(),
          }),
        });
        logger.info("Purchase notification email sent successfully");
      } catch (emailError) {
        logger.error({ error: emailError }, "Failed to send purchase notification email");
        // Don't fail the webhook if email sending fails
      }

      return NextResponse.json(formatEmptyEntity());
    }

    return NextResponse.json(formatEmptyEntity());
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "POST /api/webhooks/stripe");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error on webhook received"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
