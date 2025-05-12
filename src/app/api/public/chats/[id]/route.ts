import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { chats } from "~/db/schema";
import { logger } from "~/lib/logger";

export async function GET(
  _: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  logger.info("GET request received at /api/public/chats/[id]");

  try {
    const chatId = idHandler.decode(params.id);

    const chat = await db.query.chats.findFirst({
      where: eq(chats.id, chatId),
      with: {
        job: {
          columns: {
            candidate: true,
            role: true,
            company: true,
          },
        },
      },
    });

    if (!chat) {
      return NextResponse.json(formatErrorEntity("Chat not found"), {
        status: 404,
      });
    }

    logger.info({ id: chat.id }, "Successfully retrieved chat");
    return NextResponse.json(formatEntity(chat, "chat"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/public/chats/[id]");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/public/chats/[id]"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
