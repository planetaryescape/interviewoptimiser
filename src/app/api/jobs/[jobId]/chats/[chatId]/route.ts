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

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ jobId: string; chatId: string }> }
) {
  const params = await props.params;
  logger.info("GET request received at /api/jobs/[jobId]/chats/[chatId]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to GET /api/jobs/[jobId]/chats/[chatId]");
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

    const chatId = idHandler.decode(params.chatId);

    const jobChat = await db.query.chats.findFirst({
      where: eq(chats.id, chatId),
      with: {
        report: {
          with: {
            pageSettings: true,
          },
        },
      },
    });

    if (!jobChat) {
      return NextResponse.json(formatErrorEntity("Chat not found"), {
        status: 404,
      });
    }

    logger.info({ id: jobChat.id }, "Successfully retrieved chat with report and page settings");
    return NextResponse.json(formatEntity(jobChat, "chat"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/jobs/[jobId]/chats/[chatId]");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/jobs/[jobId]/chats/[chatId]"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
