import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/db";
import { jobDescriptions } from "~/db/schema";
import { extractKeyQuestions } from "~/lib/ai/extract-key-questions";
import { logger } from "~/lib/logger";
import { getOpenAiClient } from "~/lib/openai";

export const maxDuration = 300; // 5 minutes timeout

const extractRequestSchema = z.object({
  jobId: z.string(),
  interviewType: z.string(),
  duration: z.coerce.number(),
});

export async function POST(request: NextRequest) {
  logger.info("POST request received at /api/extract/questions");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to POST /api/extract/questions");
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
    const { jobId: jobIdString, interviewType, duration } = extractRequestSchema.parse(body);
    const jobId = idHandler.decode(jobIdString);

    const model = getOpenAiClient(email)("o3-mini");

    const jobDescription = await db.query.jobDescriptions.findFirst({
      where: eq(jobDescriptions.jobId, jobId),
    });

    if (!jobDescription) {
      logger.warn({ jobId }, "Job description not found");
      return NextResponse.json(formatErrorEntity("Job description not found"), {
        status: 404,
      });
    }

    // Extract key questions based on the job description
    const keyQuestionsResult = await extractKeyQuestions({
      model,
      jobDescriptionData: jobDescription,
      userEmail: email,
      interviewType,
      duration,
    });

    logger.info({ jobId }, "Successfully extracted key questions");

    return NextResponse.json(formatEntity(keyQuestionsResult.data.keyQuestions, "questions"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "POST /api/extract/questions");
      scope.setExtra("error", error);
      scope.setExtra("message", error instanceof Error ? error.message : error);
      Sentry.captureException(error);
    });

    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in POST /api/extract/questions"
    );

    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
