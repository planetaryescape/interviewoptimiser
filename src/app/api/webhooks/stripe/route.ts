import { db } from "@/db";
import { users } from "@/db/schema";
import { config } from "@/lib/config";
import { createDefaultApiRouteContext } from "@/lib/createDefaultApiRouteContext";
import { logger } from "@/lib/logger";
import { stripe } from "@/lib/stripe";
import { formatEmptyEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import * as Sentry from "@sentry/serverless";
import { eq, isNull, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  const context = {
    ...createDefaultApiRouteContext(request),
  };

  try {
    const signature = headers().get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        formatErrorEntity({
          error: "No signature provided",
        }),
        {
          status: 400,
        }
      );
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
        .where(
          eq(users.stripeCustomerId, event.data.object.customer as string)
        );
    } else if (event.type === "customer.subscription.deleted") {
    } else if (event.type === "checkout.session.completed") {
      const checkoutSessionId = event.data.object
        .id as Stripe.Checkout.Session["id"];

      const lineItems = await stripe.checkout.sessions.listLineItems(
        checkoutSessionId,
        {
          expand: ["data.price.product"],
        }
      );

      logger.info({ ...context, lineItems }, "Checkout session completed");

      let customerId = event.data.object.customer as string;
      const email = event.data.object.customer_details?.email || "";

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
        const minutes = parseInt(
          (lineItem.price?.product as Stripe.Product)?.metadata.minutes
        );
        const quantity = lineItem.quantity || 0;

        return acc + minutes * quantity;
      }, 0);

      logger.info(
        {
          ...context,
          products: lineItems.data.map(
            (lineItem) => (lineItem.price?.product as Stripe.Product)?.name
          ),
          customerId,
          email,
          minutes,
        },
        "Products retrieved"
      );

      const [user] = await db
        .update(users)
        .set({
          minutes: sql`${users.minutes} + ${minutes}`,
          stripeCustomerId: customerId,
        })
        .where(eq(users.stripeCustomerId, customerId))
        .returning();

      logger.info({ ...context, minutes, user }, "Minutes added");

      return NextResponse.json(formatEmptyEntity());
    }

    logger.info("Create stripe customer accounts for all users");

    const allUsers = await db
      .select()
      .from(users)
      .where(isNull(users.stripeCustomerId));

    for (const user of allUsers) {
      logger.info({ ...context, user }, "Creating stripe customer account");
      const customer = await stripe.customers.create({
        email: user.email,
      });

      logger.info({ ...context, customer }, "Stripe customer created");

      await db
        .update(users)
        .set({
          stripeCustomerId: customer.id,
        })
        .where(eq(users.id, user.id));

      logger.info({ ...context, user }, "Stripe customer account created");
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
