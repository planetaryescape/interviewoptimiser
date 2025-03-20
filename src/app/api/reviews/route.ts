import ReviewNotificationEmail from "@/emails/review-notification";
import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { config } from "~/config";
import { db } from "~/db";
import { reviews } from "~/db/schema";
import { sendDiscordDM } from "~/lib/discord";
import { logger } from "~/lib/logger";
import { resend } from "~/lib/resend";

export async function POST(request: NextRequest) {
  logger.info("POST request received at /api/reviews");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to POST /api/reviews");
    return NextResponse.json(formatErrorEntity("Unauthorized"), {
      status: 401,
    });
  }

  try {
    const { id: userId, email } = await getUserFromClerkId(clerkUserId);
    if (!userId) {
      logger.warn({ clerkUserId }, "User not found in database");
      return NextResponse.json(formatErrorEntity("User not found"), {
        status: 404,
      });
    }

    const body = await request.json();
    logger.info("Received review data");

    const [newReview] = await db
      .insert(reviews)
      .values({
        userId,
        name: body.name,
        rating: body.rating,
        comment: body.comment,
        twitterUsername: body.twitterUsername,
        linkedinUrl: body.linkedinUrl,
        showOnLanding: body.showOnLanding,
      })
      .returning();

    // Send email notification
    try {
      await resend.emails.send({
        from: `${config.projectName} Team <notifications@${config.domain}>`,
        to: config.supportEmail,
        subject: `New Review Submitted - ${body.name}`,
        react: ReviewNotificationEmail({
          name: body.name,
          rating: body.rating,
          comment: body.comment,
          twitterUsername: body.twitterUsername,
          linkedinUrl: body.linkedinUrl,
          showOnLanding: body.showOnLanding,
        }),
      });
      logger.info("Review notification email sent successfully");
    } catch (emailError) {
      logger.error({ error: emailError }, "Failed to send review notification email");
      // Don't fail the request if email sending fails
    }

    // Send Discord notification
    try {
      await sendDiscordDM({
        title: "⭐ New Review Submitted",
        metadata: {
          User: userId,
          Referer: request.referrer,
          Email: email || "Unknown",
          Name: body.name,
          Rating: "★".repeat(body.rating) + "☆".repeat(5 - body.rating),
          Comment: body.comment,
          "Show on Landing": body.showOnLanding ? "Yes" : "No",
        },
      });
    } catch (discordError) {
      logger.error({ error: discordError }, "Failed to send review notification Discord");
      // Don't fail the request if Discord sending fails
    }

    logger.info({ reviewId: newReview.id }, "Successfully created new review");
    return NextResponse.json(formatEntity(newReview, "review"), {
      status: 201,
    });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "POST /api/reviews");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in POST /api/reviews"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
