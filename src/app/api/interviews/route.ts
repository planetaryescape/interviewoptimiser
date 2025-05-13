import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { interviews, jobs } from "~/db/schema";
import { logger } from "~/lib/logger";

export async function POST(request: NextRequest) {
  logger.info("POST request received at /api/interviews");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to POST /api/interviews");
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
    const { customSessionId, chatGroupId, humeChatId, requestId, jobId: jobIdString } = body;

    if (!jobIdString) {
      logger.warn("Missing required field: jobId");
      return NextResponse.json(formatErrorEntity("Missing required field: jobId"), {
        status: 400,
      });
    }

    if (!chatGroupId) {
      logger.warn("Missing required field: chatGroupId");
      return NextResponse.json(formatErrorEntity("Missing required field: chatGroupId"), {
        status: 400,
      });
    }

    if (!humeChatId) {
      logger.warn("Missing required field: humeChatId");
      return NextResponse.json(formatErrorEntity("Missing required field: humeChatId"), {
        status: 400,
      });
    }

    const existingInterview = await db.query.interviews.findFirst({
      where: and(eq(interviews.humeChatId, humeChatId)),
    });

    const jobId = idHandler.decode(jobIdString);

    if (existingInterview) {
      logger.info({ jobId }, "Interview already exists");
      return NextResponse.json(formatEntity(existingInterview, "interview"), {
        status: 200,
      });
    }

    const [newInterview] = await db
      .insert(interviews)
      .values({
        jobId,
        customSessionId,
        chatGroupId,
        humeChatId,
        requestId,
      })
      .returning();

    logger.info({ id: newInterview.id }, "Successfully created interview");

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
    const { id: userId, role } = await getUserFromClerkId(clerkUserId);
    if (!userId) {
      logger.warn({ clerkUserId }, "User not found in database");
      return NextResponse.json(formatErrorEntity("User not found"), {
        status: 404,
      });
    }

    const url = new URL(request.url);
    const jobId = url.searchParams.get("jobId");

    if (!jobId) {
      logger.info("No jobId provided, getting all interviews");
      return NextResponse.json(formatErrorEntity("Missing jobId"), {
        status: 400,
      });
    }

    // Check if the job exists and belongs to the user
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, Number.parseInt(jobId)),
    });

    if (!job) {
      logger.warn({ jobId }, "Job not found");
      return NextResponse.json(formatErrorEntity("Job not found"), {
        status: 404,
      });
    }

    if (job.userId !== userId && role !== "admin") {
      logger.warn({ jobId }, "Unauthorized access to job");
      return NextResponse.json(formatErrorEntity("Unauthorized"), {
        status: 401,
      });
    }

    const returnedInterviews = await db.query.interviews.findMany({
      where: eq(interviews.jobId, Number.parseInt(jobId)),
    });

    if (!returnedInterviews) {
      logger.info({ jobId }, "No interviews found for this job");
      return NextResponse.json(formatEntityList([], "generic"));
    }

    logger.info({ jobId }, "Successfully retrieved interviews for job");

    return NextResponse.json(formatEntityList(returnedInterviews, "interview"));
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
