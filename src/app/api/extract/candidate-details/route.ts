import { withAuth } from "@/lib/auth-middleware";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/db";
import { candidateDetails } from "~/db/schema";
import { extractCandidateDetails } from "~/lib/ai/extract-candidate-details";
import { logger } from "~/lib/logger";
import { getOpenAiClient } from "~/lib/openai";

export const maxDuration = 300; // 5 minutes timeout

const extractRequestSchema = z.object({
  jobId: z.string(),
  cvText: z.string(),
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
      const { jobId: jobIdString, cvText } = extractRequestSchema.parse(body);
      const jobId = idHandler.decode(jobIdString);

      const model = getOpenAiClient(email)("o4-mini");

      // Run extractions in parallel
      const candidateDetailsResult = await extractCandidateDetails({
        model,
        submittedCVText: cvText,
        userEmail: email,
      });

      // Save both results in a transaction
      const [candidateDetailsRecord] = await db
        .insert(candidateDetails)
        .values({
          ...candidateDetailsResult.data,
          jobId,
        })
        .returning();

      logger.info({ jobId }, "Successfully extracted and saved candidate details");

      return NextResponse.json({
        candidateDetails: formatEntity(candidateDetailsRecord, "candidateDetails"),
      });
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "POST /api/extract/candidate-details");
        scope.setExtra("error", error);
        scope.setExtra("message", error instanceof Error ? error.message : error);
        Sentry.captureException(error);
      });

      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error in POST /api/extract/candidate-details"
      );

      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "POST /api/extract/candidate-details" }
);
