import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { chats, interviews } from "~/db/schema";
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
    const {
      customSessionId,
      chatGroupId,
      humeChatId,
      requestId,
      interviewId: interviewIdString,
    } = body;

    if (!interviewIdString) {
      logger.warn("Missing required field: interviewId");
      return NextResponse.json(formatErrorEntity("Missing required field: interviewId"), {
        status: 400,
      });
    }

    const interviewId = idHandler.decode(interviewIdString);
    console.log("interviewId:", interviewId);

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

    if (existingChat) {
      logger.info({ interviewId }, "Chat already exists");
      return NextResponse.json(formatEntity(existingChat, "chat"), {
        status: 200,
      });
    }

    const [newChat] = await db
      .insert(chats)
      .values({
        interviewId,
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
 * Optional query param: interviewId to filter by interview
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
    const interviewId = url.searchParams.get("interviewId");

    if (!interviewId) {
      logger.info("No interviewId provided, getting all chats");
      return NextResponse.json(formatErrorEntity("Missing interviewId"), {
        status: 400,
      });
    }

    // Check if the interview exists and belongs to the user
    const interview = await db.query.interviews.findFirst({
      where: eq(interviews.id, Number.parseInt(interviewId)),
    });

    if (!interview) {
      logger.warn({ interviewId }, "Interview not found");
      return NextResponse.json(formatErrorEntity("Interview not found"), {
        status: 404,
      });
    }

    if (interview.userId !== userId && role !== "admin") {
      logger.warn({ interviewId, userId }, "Unauthorized access to interview");
      return NextResponse.json(formatErrorEntity("Unauthorized"), {
        status: 401,
      });
    }

    const returnedChats = await db.query.chats.findMany({
      where: eq(chats.interviewId, Number.parseInt(interviewId)),
    });

    if (!returnedChats) {
      logger.info({ interviewId }, "No chats found for this interview");
      return NextResponse.json(formatEntityList([], "generic"));
    }

    logger.info({ interviewId }, "Successfully retrieved chats for interview");

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
