import ReviewReportEmail from "@/emails/review-report";
import * as Sentry from "@sentry/nextjs";
import { generateObject } from "ai";
import { format } from "date-fns";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { config } from "~/config";
import { db } from "~/db";
import { reviews } from "~/db/schema";
import { getModelForOperation } from "~/lib/ai/models";
import { sendDiscordDM } from "~/lib/discord";
import { inngest } from "~/lib/inngest";
import { logger } from "~/lib/logger";
import { resend } from "~/lib/resend";

const ReviewVettingResponseSchema = z.object({
  isAppropriate: z.boolean(),
  reason: z.string(),
});

export const vetReviewFn = inngest.createFunction(
  {
    id: "vet-review",
    retries: 1,
  },
  { cron: "0 1 * * *" },
  async ({ step }) => {
    const unpublishedReviews = await step.run("find-unpublished", async () => {
      return db.query.reviews.findMany({
        where: and(eq(reviews.isPublished, false), isNull(reviews.processedAt)),
      });
    });

    if (unpublishedReviews.length === 0) return { published: 0, rejected: 0 };

    const publishedReviews: Array<{
      id: number;
      content: string;
      rating: number;
      author: string;
    }> = [];
    const rejectedReviews: Array<{
      id: number;
      content: string;
      rating: number;
      author: string;
      rejectionReason: string;
    }> = [];

    for (const review of unpublishedReviews) {
      const result = await step.run(`moderate-${review.id}`, async () => {
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

        const model = getModelForOperation("vet_review", config.supportEmail);
        const { object: response } = await generateObject({
          model,
          schema: ReviewVettingResponseSchema,
          system: `You are a content moderator for a ${config.projectName} website. Your task is to evaluate testimonials for appropriateness and relevance.`,
          prompt,
          temperature: 1,
        });

        if (!response) return null;

        if (response.isAppropriate) {
          await db
            .update(reviews)
            .set({ isPublished: true, processedAt: new Date() })
            .where(eq(reviews.id, review.id));
        } else {
          await db
            .update(reviews)
            .set({ isPublished: false, processedAt: new Date() })
            .where(eq(reviews.id, review.id));
        }

        return {
          isAppropriate: response.isAppropriate,
          reason: response.reason,
          review: {
            id: review.id,
            content: review.comment ?? "",
            rating: review.rating ?? 0,
            author: review.name ?? "",
          },
        };
      });

      if (!result) continue;

      if (result.isAppropriate) {
        publishedReviews.push(result.review);
      } else {
        rejectedReviews.push({
          ...result.review,
          rejectionReason: result.reason,
        });
      }
    }

    // Send report
    await step.run("send-report", async () => {
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
    });

    return { published: publishedReviews.length, rejected: rejectedReviews.length };
  }
);
