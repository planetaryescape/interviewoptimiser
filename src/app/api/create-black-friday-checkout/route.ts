import { withAuth } from "@/lib/auth-middleware";
import { formatErrorEntity } from "@/lib/utils/formatEntity";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { config } from "~/config";
import { logger } from "~/lib/logger";
import { stripe } from "~/lib/stripe";

export const POST = withAuth(
  async (_request, { user }) => {
    try {
      if (!user.id) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      const { stripeCustomerId } = user;

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ["card"],
        line_items: [
          {
            quantity: 1,
            price: config.blackFridayPriceId,
            adjustable_quantity: {
              enabled: true,
            },
          },
        ],
        mode: "payment",
        automatic_tax: { enabled: true },
        customer_update: {
          address: "auto",
        },
        success_url: `${config.baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.baseUrl}/checkout/black-friday`,
        metadata: {
          userId: user.id,
          productType: "minutes",
          minutesAmount: "500",
          promoType: "black-friday-2024",
        },
      });

      return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "POST /api/create-black-friday-checkout");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error creating checkout session"
      );
      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "POST /api/create-black-friday-checkout" }
);
