import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { chatMetadata, interviews } from "~/db/schema";
import { logger } from "~/lib/logger";

/**
 * Creates a new chat metadata entry
 */
export async function POST(request: NextRequest) {
  logger.info("POST request received at /api/chat-metadata");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to POST /api/chat-metadata");
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
    const { interviewId, customSessionId, chatGroupId, chatId, requestId } = body;

    if (!interviewId) {
      logger.warn("Missing required field: interviewId");
      return NextResponse.json(formatErrorEntity("Missing required field: interviewId"), {
        status: 400,
      });
    }

    if (!chatGroupId) {
      logger.warn("Missing required field: chatGroupId");
      return NextResponse.json(formatErrorEntity("Missing required field: chatGroupId"), {
        status: 400,
      });
    }

    if (!chatId) {
      logger.warn("Missing required field: chatId");
      return NextResponse.json(formatErrorEntity("Missing required field: chatId"), {
        status: 400,
      });
    }

    // Check if the interview exists and belongs to the user
    const interview = await db.query.interviews.findFirst({
      where: eq(interviews.id, interviewId),
    });

    if (!interview) {
      logger.warn({ interviewId }, "Interview not found");
      return NextResponse.json(formatErrorEntity("Interview not found"), {
        status: 404,
      });
    }

    if (interview.userId !== userId) {
      logger.warn({ interviewId, userId }, "Unauthorized access to interview");
      return NextResponse.json(formatErrorEntity("Unauthorized"), {
        status: 401,
      });
    }

    // Check if metadata for this interview already exists
    const existingMetadata = await db.query.chatMetadata.findFirst({
      where: eq(chatMetadata.interviewId, interviewId),
    });

    if (existingMetadata) {
      logger.warn({ interviewId }, "Chat metadata for this interview already exists");
      return NextResponse.json(
        formatErrorEntity("Chat metadata for this interview already exists"),
        {
          status: 409,
        }
      );
    }

    const [newChatMetadata] = await db
      .insert(chatMetadata)
      .values({
        interviewId,
        customSessionId,
        chatGroupId,
        chatId,
        requestId,
      })
      .returning();

    logger.info({ id: newChatMetadata.id }, "Successfully created chat metadata");

    return NextResponse.json(formatEntity(newChatMetadata, "chatMetadata"), {
      status: 201,
    });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "POST /api/chat-metadata");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in POST /api/chat-metadata"
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
  logger.info("GET request received at /api/chat-metadata");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to GET /api/chat-metadata");
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
      logger.info("No interviewId provided, getting all chat metadata");
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

    const metadata = await db.query.chatMetadata.findFirst({
      where: eq(chatMetadata.interviewId, Number.parseInt(interviewId)),
    });

    if (!metadata) {
      logger.info({ interviewId }, "No chat metadata found for this interview");
      return NextResponse.json(formatEntityList([], "generic"));
    }

    logger.info({ interviewId }, "Successfully retrieved chat metadata for interview");
    return NextResponse.json(formatEntity(metadata, "chatMetadata"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/chat-metadata");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/chat-metadata"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
