import ReviewReportEmail from "@/emails/review-report";
import * as Sentry from "@sentry/aws-serverless";
import { format } from "date-fns";
import { and, eq, isNull } from "drizzle-orm";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { config } from "~/config";
import { db } from "~/db";
import { reviews } from "~/db/schema";
import { sendDiscordDM } from "~/lib/discord";
import { logger } from "~/lib/logger";
import { getOpenAiClientOld } from "~/lib/openai";
import { resend } from "~/lib/resend";
import { initSentry } from "../lib/sentry";

initSentry();

const ReviewVettingResponseSchema = z.object({
  isAppropriate: z.boolean(),
  reason: z.string(),
});

export const handler = Sentry.wrapHandler(async () => {
  try {
    logger.info("Starting review vetting process");

    // Get all unpublished reviews
    const unpublishedReviews = await db.query.reviews.findMany({
      where: and(eq(reviews.isPublished, false), isNull(reviews.processedAt)),
    });

    logger.info({ count: unpublishedReviews.length }, "Found unpublished reviews");

    const publishedReviews = [];
    const rejectedReviews = [];

    for (const review of unpublishedReviews) {
      const prompt = `
        Please review this testimonial for ${config.projectName} and determine if it's appropriate for public display.
        Consider the following criteria:
        1. Is it relevant to ${config.projectName} or job seeking?
        2. Is it free from inappropriate content (NSFW, hate speech, etc.)?
        3. Is it a genuine review (not spam or completely unrelated)?

        Note: Do NOT reject negative reviews if they are legitimate feedback about the service.

        Review to evaluate:
        "${review.comment}"
      `;

      const completion = await getOpenAiClientOld(config.supportEmail).beta.chat.completions.parse({
        model: "o3-mini",
        messages: [
          {
            role: "system",
            content: `You are a content moderator for a ${config.projectName} website. Your task is to evaluate testimonials for appropriateness and relevance.`,
          },
          { role: "user", content: prompt },
        ],
        response_format: zodResponseFormat(ReviewVettingResponseSchema, "reviewVetting"),
        temperature: 0.1,
      });

      if (!completion.choices[0].message.parsed) {
        logger.error("No parsed response returned from OpenAI");
        continue;
      }

      const response = completion.choices[0].message.parsed;

      if (response.isAppropriate) {
        await db
          .update(reviews)
          .set({ isPublished: true, processedAt: new Date() })
          .where(eq(reviews.id, review.id));
        publishedReviews.push({
          id: review.id,
          content: review.comment,
          rating: review.rating,
          author: review.name,
        });
      } else {
        await db
          .update(reviews)
          .set({ isPublished: false, processedAt: new Date() })
          .where(eq(reviews.id, review.id));
        rejectedReviews.push({
          id: review.id,
          content: review.comment,
          rating: review.rating,
          author: review.name,
          rejectionReason: response.reason,
        });
      }

      logger.info(
        {
          reviewId: review.id,
          isAppropriate: response.isAppropriate,
          reason: response.reason,
        },
        "Review processed"
      );
    }

    // Send email report
    if (unpublishedReviews.length > 0) {
      await resend.emails.send({
        from: `${config.projectName} <reviews@${config.domain}>`,
        to: config.supportEmail,
        subject: `Review Moderation Report - ${format(new Date(), "yyyy-MM-dd")}`,
        react: ReviewReportEmail({
          publishedReviews,
          rejectedReviews,
          date: format(new Date(), "MMMM d, yyyy"),
        }),
      });

      await sendDiscordDM({
        title: "📋 Review Moderation Report",
        metadata: {
          Date: format(new Date(), "MMMM d, yyyy"),
          Published: publishedReviews.length,
          Rejected: rejectedReviews.length,
        },
      });

      logger.info("Sent review report email and Discord notification");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Review vetting completed",
        publishedCount: publishedReviews.length,
        rejectedCount: rejectedReviews.length,
      }),
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "vet-review");
      scope.setExtra("error", error);
      scope.setExtra("message", error instanceof Error ? error.message : error);
      Sentry.captureException(error);
    });

    logger.error(
      { error: error instanceof Error ? error.message : error },
      "Error in review vetting process"
    );

    throw error;
  }
});

export default handler;
