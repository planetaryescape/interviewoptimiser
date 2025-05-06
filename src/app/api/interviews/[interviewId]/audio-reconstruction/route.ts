import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { requestChatAudioReconstruction } from "@/lib/utils/hume-audio-reconstruction";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { chatMetadata, reports } from "~/db/schema";
import { logger } from "~/lib/logger";

/**
 * Initiates audio reconstruction for an interview
 */
export async function GET(request: NextRequest, props: { params: Promise<{ reportId: string }> }) {
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
    const report = await db.query.reports.findFirst({
      where: eq(reports.id, idHandler.decode(params.reportId)),
      with: {
        interview: true,
      },
    });

    if (!report) {
      logger.warn({ reportId: params.reportId }, "Report not found");
      return NextResponse.json(formatErrorEntity("Report not found"), {
        status: 404,
      });
    }

    if (report.interview.userId !== userId && role !== "admin") {
      logger.warn({ reportId: params.reportId, userId }, "Unauthorized access to report");
      return NextResponse.json(formatErrorEntity("Unauthorized"), {
        status: 401,
      });
    }

    // Get the chat metadata associated with the interview
    const metadata = await db.query.chatMetadata.findFirst({
      where: eq(chatMetadata.reportId, idHandler.decode(params.reportId)),
    });

    if (!metadata || !metadata.chatId) {
      logger.warn({ reportId: params.reportId }, "No chat metadata found for this report");
      return NextResponse.json(formatErrorEntity("No chat metadata found for this report"), {
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
            reportId: params.reportId,
          },
          "generic"
        )
      );
    } catch (error) {
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
          reportId: params.reportId,
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
