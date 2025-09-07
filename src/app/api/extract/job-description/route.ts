import { withAuth } from "@/lib/auth-middleware";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/db";
import { jobDescriptions } from "~/db/schema";
import { extractJobDescription } from "~/lib/ai/extract-job-description";
import { logger } from "~/lib/logger";
import { getOpenAiClient } from "~/lib/openai";

export const maxDuration = 300; // 5 minutes timeout

const extractRequestSchema = z.object({
  jobId: z.string(),
  jobDescriptionText: z.string(),
});

export const POST = withAuth(
  async (request, { user }) => {
    try {
      const { email } = user;
      if (!user.id) {
        logger.warn({ userId: user.id }, "User not found in database");
        return NextResponse.json(formatErrorEntity("User not found"), {
          status: 404,
        });
      }

      const body = await request.json();
      const { jobDescriptionText, jobId: jobIdString } = extractRequestSchema.parse(body);
      const jobId = idHandler.decode(jobIdString);

      const model = getOpenAiClient(email)("o4-mini");

      // Run extractions in parallel
      const jobDescriptionResult = await extractJobDescription({
        model,
        jobDescriptionText: jobDescriptionText,
        userEmail: email,
      });

      // Save both results in a transaction
      const [jobDescriptionRecord] = await db
        .insert(jobDescriptions)
        .values({
          ...jobDescriptionResult.data,
          jobId,
        })
        .returning();

      logger.info({ jobId }, "Successfully extracted and saved job description");

      // Encode IDs before sending to client
      const encodedJobDescription = {
        ...jobDescriptionRecord,
        id: idHandler.encode(jobDescriptionRecord.id),
        jobId: idHandler.encode(jobDescriptionRecord.jobId),
      };

      return NextResponse.json({
        jobDescription: formatEntity(encodedJobDescription, "jobDescription"),
      });
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "POST /api/jobs/extract");
        scope.setExtra("error", error);
        scope.setExtra("message", error instanceof Error ? error.message : error);
        Sentry.captureException(error);
      });

      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error in POST /api/jobs/extract"
      );

      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "POST /api/extract/job-description" }
);
