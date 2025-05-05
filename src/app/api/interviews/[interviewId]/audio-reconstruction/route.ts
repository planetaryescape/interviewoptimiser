import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { requestChatAudioReconstruction } from "@/lib/utils/hume-audio-reconstruction";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { chatMetadata, interviews } from "~/db/schema";
import { logger } from "~/lib/logger";

/**
 * Initiates audio reconstruction for an interview
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ interviewId: string }> }
) {
  const params = await props.params;
  logger.info("GET request received at /api/interviews/[interviewId]/audio-reconstruction");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn(
      "Unauthorized access attempt to GET /api/interviews/[interviewId]/audio-reconstruction"
    );
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

    // Check if the interview exists and belongs to the user
    const interview = await db.query.interviews.findFirst({
      where: eq(interviews.id, Number.parseInt(params.interviewId)),
    });

    if (!interview) {
      logger.warn({ interviewId: params.interviewId }, "Interview not found");
      return NextResponse.json(formatErrorEntity("Interview not found"), {
        status: 404,
      });
    }

    if (interview.userId !== userId && role !== "admin") {
      logger.warn({ interviewId: params.interviewId, userId }, "Unauthorized access to interview");
      return NextResponse.json(formatErrorEntity("Unauthorized"), {
        status: 401,
      });
    }

    // Get the chat metadata associated with the interview
    const metadata = await db.query.chatMetadata.findFirst({
      where: eq(chatMetadata.interviewId, Number.parseInt(params.interviewId)),
    });

    if (!metadata || !metadata.chatId) {
      logger.warn({ interviewId: params.interviewId }, "No chat metadata found for this interview");
      return NextResponse.json(formatErrorEntity("No chat metadata found for this interview"), {
        status: 404,
      });
    }

    try {
      // Request audio reconstruction from Hume API
      const reconstructionResponse = await requestChatAudioReconstruction(metadata.chatId);

      // Return the reconstruction status
      return NextResponse.json(
        formatEntity(
          {
            reconstruction: reconstructionResponse,
            interviewId: params.interviewId,
          },
          "generic"
        )
      );
    } catch (error) {
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
          interviewId: params.interviewId,
        },
        "Error in audio reconstruction process"
      );

      return NextResponse.json(
        formatErrorEntity(error instanceof Error ? error.message : "Unknown error"),
        { status: 500 }
      );
    }
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/interviews/[interviewId]/audio-reconstruction");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/interviews/[interviewId]/audio-reconstruction"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
