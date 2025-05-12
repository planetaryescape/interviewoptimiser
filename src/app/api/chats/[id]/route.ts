import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { chats } from "~/db/schema";
import { logger } from "~/lib/logger";

/**
 * Retrieves a specific chat metadata record by ID
 */
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  logger.info("GET request received at /api/chat-metadata/[id]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to GET /api/chat-metadata/[id]");
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

    const metadataId = idHandler.decode(params.id);

    const metadata = await db.query.chats.findFirst({
      where: eq(chats.id, metadataId),
    });

    if (!metadata) {
      return NextResponse.json(formatErrorEntity("Chat metadata not found"), {
        status: 404,
      });
    }

    logger.info({ id: metadata.id }, "Successfully retrieved chat metadata");
    return NextResponse.json(formatEntity(metadata, "chat"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/chat-metadata/[id]");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/chat-metadata/[id]"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}

/**
 * Updates a specific chat metadata record
 */
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  logger.info("PUT request received at /api/chat-metadata/[id]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to PUT /api/chat-metadata/[id]");
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

    const metadataId = idHandler.decode(params.id);
    const chat = await db.query.chats.findFirst({
      where: eq(chats.id, metadataId),
    });

    if (!chat) {
      return NextResponse.json(formatErrorEntity("Chat metadata not found"), {
        status: 404,
      });
    }

    const body = await request.json();
    const { transcript, customSessionId, chatGroupId, humeChatId, requestId, actualTime } = body;

    // Ensure required fields are present
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

    const [updatedMetadata] = await db
      .update(chats)
      .set({
        customSessionId,
        chatGroupId,
        humeChatId,
        requestId,
        actualTime,
        transcript,
        updatedAt: new Date(),
      })
      .where(eq(chats.id, metadataId))
      .returning();

    logger.info({ id: updatedMetadata.id }, "Successfully updated chat metadata");
    return NextResponse.json(formatEntity(updatedMetadata, "chat"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "PUT /api/chats/[id]");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in PUT /api/chats/[id]"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}

/**
 * Deletes a specific chat metadata record
 */
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  logger.info("DELETE request received at /api/chats/[id]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to DELETE /api/chats/[id]");
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

    const metadataId = idHandler.decode(params.id);
    const chat = await db.query.chats.findFirst({
      where: eq(chats.id, metadataId),
    });

    if (!chat) {
      return NextResponse.json(formatErrorEntity("Chat not found"), {
        status: 404,
      });
    }

    await db.delete(chats).where(eq(chats.id, metadataId));

    logger.info({ id: chat.id }, "Successfully deleted chat");
    return NextResponse.json({ status: "success" });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "DELETE /api/chats/[id]");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in DELETE /api/chats/[id]"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
