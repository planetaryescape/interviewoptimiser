import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { formatErrorEntity } from "@/lib/utils/formatEntity";
import { isFomoDiscountActive } from "@/lib/utils/isFomoDiscountActive";
import { config } from "~/config";
import { logger } from "~/lib/logger";
import { stripe } from "~/lib/stripe";

export const POST = withAuth(
  async (request, { user }) => {
    try {
      const { stripeCustomerId } = user;
      const { priceId } = await request.json();

      const offerActive = isFomoDiscountActive();

      const isDev = process.env.NODE_ENV === "development";

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: "payment",
        line_items: [
          {
            quantity: 1,
            price: priceId,
            adjustable_quantity: {
              enabled: true,
            },
          },
        ],
        automatic_tax: { enabled: true },
        customer_update: {
          address: "auto",
        },
        ...(offerActive
          ? {
              discounts: [
                {
                  promotion_code: isDev
                    ? "promo_1QDCT3AN8Y6xS9fBWYo0bIee"
                    : "promo_1QDCsMAN8Y6xS9fBmew0u7jP",
                },
              ],
            }
          : { allow_promotion_codes: true }),
        success_url: `${config.baseUrl}/dashboard/create`,
        cancel_url: `${config.baseUrl}/pricing`,
      });

      return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "POST /api/create-checkout-session");
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
  { routeName: "POST /api/create-checkout-session" }
);
