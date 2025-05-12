import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { requestChatAudioReconstruction } from "@/lib/utils/hume-audio-reconstruction";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { chats, jobs } from "~/db/schema";
import { logger } from "~/lib/logger";

/**
 * Initiates audio reconstruction for an interview
 */
export async function GET(request: NextRequest, props: { params: Promise<{ jobId: string }> }) {
  const params = await props.params;
  logger.info("GET request received at /api/jobs/[jobId]/audio-reconstruction");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to GET /api/jobs/[jobId]/audio-reconstruction");
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

    const jobId = idHandler.decode(params.jobId);

    // Check if the interview exists and belongs to the user
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, jobId),
      with: {
        chats: {
          with: {
            report: true,
          },
        },
      },
    });

    if (!job) {
      logger.warn({ jobId }, "Job not found");
      return NextResponse.json(formatErrorEntity("Job not found"), {
        status: 404,
      });
    }

    if (job.userId !== userId && role !== "admin") {
      logger.warn({ jobId, userId }, "Unauthorized access to job");
      return NextResponse.json(formatErrorEntity("Unauthorized"), {
        status: 401,
      });
    }

    // Get the chat metadata associated with the interview
    const returnedChats = await db.query.chats.findFirst({
      where: eq(chats.jobId, jobId),
    });

    if (!returnedChats || !returnedChats.humeChatId) {
      logger.warn({ jobId }, "No chat metadata found for this job");
      return NextResponse.json(formatErrorEntity("No chat metadata found for this job"), {
        status: 404,
      });
    }

    try {
      // Request audio reconstruction from Hume API
      const reconstructionResponse = await requestChatAudioReconstruction(returnedChats.humeChatId);

      // Return the reconstruction status
      return NextResponse.json(
        formatEntity(
          {
            reconstruction: reconstructionResponse,
            jobId,
          },
          "generic"
        )
      );
    } catch (error) {
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
          jobId,
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
      scope.setExtra("context", "GET /api/jobs/[jobId]/audio-reconstruction");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/jobs/[jobId]/audio-reconstruction"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
