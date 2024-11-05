import { db } from "@/db";
import { reviews } from "@/db/schema";
import ReviewReportEmail from "@/emails/review-report";
import { getOpenAiClient } from "@/lib/ai/openai";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import { resend } from "@/lib/resend";
import * as Sentry from "@sentry/aws-serverless";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

Sentry.init({
  dsn: "https://6c0af4af9084afc6ecc6166ade3c37c4@o4508119114514432.ingest.de.sentry.io/4508248043814992",
  integrations: [nodeProfilingIntegration()],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions

  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

const ReviewVettingResponseSchema = z.object({
  isAppropriate: z.boolean(),
  reason: z.string(),
});

export const handler = Sentry.wrapHandler(async () => {
  try {
    logger.info("Starting review vetting process");

    // Get all unpublished reviews
    const unpublishedReviews = await db.query.reviews.findMany({
      where: eq(reviews.isPublished, false),
    });

    logger.info(
      { count: unpublishedReviews.length },
      "Found unpublished reviews"
    );

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

      const completion = await getOpenAiClient(
        config.supportEmail
      ).beta.chat.completions.parse({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a content moderator for a ${config.projectName} website. Your task is to evaluate testimonials for appropriateness and relevance.`,
          },
          { role: "user", content: prompt },
        ],
        response_format: zodResponseFormat(
          ReviewVettingResponseSchema,
          "reviewVetting"
        ),
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
          .set({ isPublished: true })
          .where(eq(reviews.id, review.id));
        publishedReviews.push({
          id: review.id,
          content: review.comment,
          rating: review.rating,
          author: review.name,
        });
      } else {
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
        subject: `Review Moderation Report - ${format(
          new Date(),
          "yyyy-MM-dd"
        )}`,
        react: ReviewReportEmail({
          publishedReviews,
          rejectedReviews,
          date: format(new Date(), "MMMM d, yyyy"),
        }),
      });

      logger.info("Sent review report email");
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
      Sentry.captureException(error);
    });

    logger.error(
      { error: error instanceof Error ? error.message : error },
      "Error in review vetting process"
    );

    throw error;
  }
});
