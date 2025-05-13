import { getUserFromClerkId } from "@/lib/auth";
import { sanitiseUserInputText } from "@/lib/sanitiseUserInputText";
import { formatEntity, formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { config } from "~/config";
import { db } from "~/db";
import { jobs } from "~/db/schema";
import { logger } from "~/lib/logger";

export async function POST(request: NextRequest) {
  logger.info("POST request received at /api/jobs");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to POST /api/jobs");
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
    const { submittedCVText, jobDescriptionText, additionalInfo, duration, type } = body;
    logger.info("Received job data");

    const [newJob] = await db.transaction(async (tx) => {
      logger.info({}, "Sanitising user input");
      const sanitisedSubmittedCVText = sanitiseUserInputText(submittedCVText, {
        truncate: true,
        maxLength: config.maxTextLengths.cv,
      });
      const sanitisedJobDescriptionText = sanitiseUserInputText(jobDescriptionText, {
        truncate: true,
        maxLength: config.maxTextLengths.jobDescription,
      });
      const sanitisedAdditionalInfo = sanitiseUserInputText(additionalInfo, {
        truncate: true,
        maxLength: config.maxTextLengths.additionalInfo,
      });

      logger.info({}, "Creating new job");
      const [createdJob] = await tx
        .insert(jobs)
        .values({
          userId,
          type: type ?? "behavioral",
          duration: duration ?? 15,
          submittedCVText: sanitisedSubmittedCVText,
          jobDescriptionText: sanitisedJobDescriptionText,
          additionalInfo: sanitisedAdditionalInfo,
        })
        .returning();

      logger.info({ jobId: createdJob.id }, "Successfully created new job");

      return [createdJob];
    });

    logger.info({ jobId: newJob.id }, "Successfully created new job");

    return NextResponse.json(formatEntity(newJob, "job"), {
      status: 201,
    });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "POST /api/jobs");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in POST /api/jobs"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}

export async function GET(request: NextRequest) {
  logger.info("GET request received at /api/jobs");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to GET /api/jobs");
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

    const userJobs = await db.query.jobs.findMany({
      where: eq(jobs.userId, userId),
      orderBy: desc(jobs.createdAt),
      with: {
        interviews: {
          with: {
            report: true,
          },
        },
        candidateDetails: true,
        jobDescription: true,
      },
    });

    logger.info({ count: userJobs.length }, "Successfully retrieved jobs");
    return NextResponse.json(formatEntityList(userJobs, "job"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/jobs");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/jobs"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
