import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { chats, jobs } from "~/db/schema";
import { logger } from "~/lib/logger";

/**
 * Creates a new chat in an idempotent way.
 *
 * If a chat with the same humeChatId already exists,
 * returns the existing record and does not create a new chat.
 * Otherwise, creates a new chat.
 *
 * This endpoint is idempotent: repeated POSTs with the same identifiers will not create duplicates.
 */
export async function POST(request: NextRequest) {
  logger.info("POST request received at /api/chats");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to POST /api/chats");
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

    const existingChat = await db.query.chats.findFirst({
      where: and(eq(chats.humeChatId, humeChatId)),
    });

    const jobId = idHandler.decode(jobIdString);

    if (existingChat) {
      logger.info({ jobId }, "Chat already exists");
      return NextResponse.json(formatEntity(existingChat, "chat"), {
        status: 200,
      });
    }

    const [newChat] = await db
      .insert(chats)
      .values({
        jobId,
        customSessionId,
        chatGroupId,
        humeChatId,
        requestId,
      })
      .returning();

    logger.info({ id: newChat.id }, "Successfully created chat");

    return NextResponse.json(formatEntity(newChat, "chat"), {
      status: 201,
    });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "POST /api/chats");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in POST /api/chats"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}

/**
 * Gets chat metadata entries for the user
 * Optional query param: jobId to filter by job
 */
export async function GET(request: NextRequest) {
  logger.info("GET request received at /api/chats");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to GET /api/chats");
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
      logger.info("No jobId provided, getting all chats");
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

    const returnedChats = await db.query.chats.findMany({
      where: eq(chats.jobId, Number.parseInt(jobId)),
    });

    if (!returnedChats) {
      logger.info({ jobId }, "No chats found for this job");
      return NextResponse.json(formatEntityList([], "generic"));
    }

    logger.info({ jobId }, "Successfully retrieved chats for job");

    return NextResponse.json(formatEntityList(returnedChats, "chat"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/chats");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/chats"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
