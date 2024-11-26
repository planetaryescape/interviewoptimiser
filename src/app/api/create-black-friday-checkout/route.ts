import { getUserFromClerkId } from "@/lib/auth";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import { stripe } from "@/lib/stripe";
import { formatErrorEntity } from "@/lib/utils/formatEntity";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = getAuth(request);
    if (!clerkUserId) {
      logger.error({ clerkUserId }, "Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = await getUserFromClerkId(clerkUserId);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { stripeCustomerId } = await getUserFromClerkId(clerkUserId);

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
        userId,
        productType: "minutes",
        minutesAmount: 500,
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
}
