import { db } from "@/db";
import { interviews } from "@/db/schema";
import { getUserFromClerkId } from "@/lib/auth";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import { sanitiseUserInputText } from "@/lib/sanitiseUserInputText";
import {
  formatEntity,
  formatEntityList,
  formatErrorEntity,
} from "@/lib/utils/formatEntity";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  logger.info("POST request received at /api/interviews");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to POST /api/optimizations");
    return NextResponse.json(formatErrorEntity("Unauthorized"), {
      status: 401,
    });
  }

  try {
    const { id: userId } = await getUserFromClerkId(clerkUserId);
    if (!userId) {
      logger.warn({ clerkUserId }, "User not found in database");
      return NextResponse.json(formatErrorEntity("User not found"), {
        status: 404,
      });
    }

    const body = await request.json();
    const {
      submittedCVText,
      jobDescriptionText,
      additionalInfo,
      duration,
      type,
    } = body;
    logger.info("Received interview data");

    const [newInterview] = await db.transaction(async (tx) => {
      logger.info({}, "Sanitising user input");
      const sanitisedSubmittedCVText = sanitiseUserInputText(submittedCVText, {
        truncate: true,
        maxLength: config.maxTextLengths.cv,
      });
      const sanitisedJobDescriptionText = sanitiseUserInputText(
        jobDescriptionText,
        {
          truncate: true,
          maxLength: config.maxTextLengths.jobDescription,
        }
      );
      const sanitisedAdditionalInfo = sanitiseUserInputText(additionalInfo, {
        truncate: true,
        maxLength: config.maxTextLengths.additionalInfo,
      });

      logger.info({}, "Creating new optimization");
      const [createdInterview] = await tx
        .insert(interviews)
        .values({
          userId,
          type: type ?? "behavioral",
          duration: duration ?? 15,
          submittedCVText: sanitisedSubmittedCVText,
          jobDescriptionText: sanitisedJobDescriptionText,
          additionalInfo: sanitisedAdditionalInfo,
        })
        .returning();

      logger.info(
        { interviewId: createdInterview.id },
        "Successfully created new interview"
      );

      logger.info(
        {
          interviewId: createdInterview.id,
        },
        "Successfully created new sections order"
      );

      return [createdInterview];
    });

    logger.info(
      { interviewId: newInterview.id },
      "Successfully created new interview"
    );

    return NextResponse.json(formatEntity(newInterview, "interview"), {
      status: 201,
    });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "POST /api/interviews");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in POST /api/interviews"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}

export async function GET(request: NextRequest) {
  logger.info("GET request received at /api/interviews");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to GET /api/interviews");
    return NextResponse.json(formatErrorEntity("Unauthorized"), {
      status: 401,
    });
  }

  try {
    const { id: userId } = await getUserFromClerkId(clerkUserId);
    if (!userId) {
      logger.warn({ clerkUserId }, "User not found in database");
      return NextResponse.json(formatErrorEntity("User not found"), {
        status: 404,
      });
    }

    const userInterviews = await db.query.interviews.findMany({
      where: eq(interviews.userId, userId),
      orderBy: desc(interviews.createdAt),
      with: {
        report: true,
      },
    });

    logger.info(
      { count: userInterviews.length },
      "Successfully retrieved interviews"
    );
    return NextResponse.json(formatEntityList(userInterviews, "interview"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/interviews");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/interviews"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
