import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { requestChatAudioReconstruction } from "@/lib/utils/hume-audio-reconstruction";
import { idHandler } from "@/lib/utils/idHandler";
import { db } from "~/db";
import { interviews } from "~/db/schema";
import { logger } from "~/lib/logger";

/**
 * Initiates audio reconstruction for an interview
 */
export const GET = withAuth<{ id: string }>(
  async (_request, { user, params }) => {
    try {
      const { role } = user;
      if (!user.id) {
        logger.warn({ userId: user.id }, "User not found in database");
        return NextResponse.json(formatErrorEntity("User not found"), {
          status: 404,
        });
      }

      const interviewId = idHandler.decode(params!.id);

      // Check if the interview exists and belongs to the user
      const interview = await db.query.interviews.findFirst({
        where: eq(interviews.id, interviewId),
        with: {
          report: true,
          job: true,
        },
      });

      if (!interview) {
        logger.warn({ interviewId }, "Interview not found");
        return NextResponse.json(formatErrorEntity("Interview not found"), {
          status: 404,
        });
      }

      if (interview.job.userId !== user.id && role !== "admin") {
        logger.warn(
          { interviewId, jobId: interview.job.id, userId: user.id },
          "Unauthorized access to interview"
        );
        return NextResponse.json(formatErrorEntity("Unauthorized"), {
          status: 401,
        });
      }

      if (!interview.humeChatId) {
        logger.warn({ interviewId }, "No hume chat id found for this interview");
        return NextResponse.json(formatErrorEntity("No hume chat id found for this interview"), {
          status: 404,
        });
      }

      try {
        // Request audio reconstruction from Hume API
        const reconstructionResponse = await requestChatAudioReconstruction(interview.humeChatId);

        // Return the reconstruction status
        return NextResponse.json(
          formatEntity(
            {
              reconstruction: reconstructionResponse,
              interviewId,
            },
            "generic"
          )
        );
      } catch (error) {
        logger.error(
          {
            message: error instanceof Error ? error.message : "Unknown error",
            error,
            interviewId,
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
        scope.setExtra("context", "GET /api/interviews/[id]/audio-reconstruction");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error in GET /api/interviews/[id]/audio-reconstruction"
      );
      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "GET /api/interviews/[id]/audio-reconstruction" }
);
