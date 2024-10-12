import { getUserFromClerkId } from "@/lib/auth";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import { stripe } from "@/lib/stripe";
import { formatErrorEntity } from "@/lib/utils/formatEntity";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/serverless";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.error({ clerkUserId }, "Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { stripeCustomerId } = await getUserFromClerkId(clerkUserId);
    const { priceId } = await request.json();

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
      allow_promotion_codes: true,
      success_url: `${config.baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
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
}
