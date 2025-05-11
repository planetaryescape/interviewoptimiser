import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/db";
import { candidateDetails, interviews, jobDescriptions } from "~/db/schema";
import { extractCandidateDetails } from "~/lib/ai/extract-candidate-details";
import { extractJobDescription } from "~/lib/ai/extract-job-description";
import { extractKeyQuestions } from "~/lib/ai/extract-key-questions";
import { logger } from "~/lib/logger";
import { getOpenAiClient } from "~/lib/openai";

export const maxDuration = 300; // 5 minutes timeout

const extractRequestSchema = z.object({
  cvText: z.string(),
  jobDescriptionText: z.string(),
  interviewId: z.number(),
  interviewType: z.string(),
});

export async function POST(request: NextRequest) {
  logger.info("POST request received at /api/interviews/extract");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to POST /api/interviews/extract");
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
    const { cvText, jobDescriptionText, interviewId, interviewType } =
      extractRequestSchema.parse(body);

    const model = getOpenAiClient(email)("o3-mini");

    // Run extractions in parallel
    const [candidateDetailsResult, jobDescriptionResult] = await Promise.all([
      extractCandidateDetails({
        model,
        submittedCVText: cvText,
        userEmail: email,
      }),
      extractJobDescription({
        model,
        jobDescriptionText: jobDescriptionText,
        userEmail: email,
      }),
    ]);

    // Extract key questions based on the job description
    const keyQuestionsResult = await extractKeyQuestions({
      model,
      jobDescriptionData: jobDescriptionResult.data,
      userEmail: email,
      interviewType,
    });

    // Save both results in a transaction
    const [savedCandidateDetails, savedJobDescription] = await db.transaction(async (tx) => {
      const [candidateDetailsRecord] = await tx
        .insert(candidateDetails)
        .values({
          ...candidateDetailsResult.data,
          interviewId,
        })
        .returning();

      const [jobDescriptionRecord] = await tx
        .insert(jobDescriptions)
        .values({
          ...jobDescriptionResult.data,
          keyQuestions: keyQuestionsResult.data.keyQuestions,
          interviewId,
        })
        .returning();

      await tx
        .update(interviews)
        .set({
          candidate: candidateDetailsRecord.name,
          company: jobDescriptionRecord.company,
          role: jobDescriptionRecord.role,
        })
        .where(eq(interviews.id, interviewId));

      return [candidateDetailsRecord, jobDescriptionRecord];
    });

    logger.info(
      { interviewId },
      "Successfully extracted and saved candidate details and job description"
    );

    return NextResponse.json({
      candidateDetails: formatEntity(savedCandidateDetails, "candidateDetails"),
      jobDescription: formatEntity(savedJobDescription, "jobDescription"),
    });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "POST /api/interviews/extract");
      scope.setExtra("error", error);
      scope.setExtra("message", error instanceof Error ? error.message : error);
      Sentry.captureException(error);
    });

    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in POST /api/interviews/extract"
    );

    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
