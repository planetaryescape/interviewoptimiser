import { getUserFromClerkId } from "@/lib/auth";
import { formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { config } from "~/config";
import { logger } from "~/lib/logger";

const API_GATEWAY_URL = config.apiGatewayUrlAddToQueue;

const API_KEY = process.env.INTERVIEWOPTIMISER_API_KEY;

export async function POST(req: NextRequest) {
  try {
    logger.info("Received request at /api/report");
    const { interviewId: interviewIdString, reportId: reportIdString } = await req.json();
    const interviewId = idHandler.decode(interviewIdString);
    const reportId = idHandler.decode(reportIdString);
    logger.info({ interviewId, reportId }, "Interview ID and report ID for report generation");

    const { userId: clerkUserId } = getAuth(req);
    if (!clerkUserId) {
      logger.error("Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = await getUserFromClerkId(clerkUserId);
    if (!userId) {
      logger.error("User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!reportId) {
      logger.error("Failed to decode report ID");
      return NextResponse.json({ error: "Failed to decode report ID" }, { status: 500 });
    }

    // Configure the API requests
    const reportRequest = fetch(API_GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY || "",
      },
      body: JSON.stringify({
        data: {
          interviewId,
          reportId,
        },
        userId,
        queueType: "generate-report",
      }),
    });

    const audioRequest = fetch(API_GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY || "",
      },
      body: JSON.stringify({
        data: {
          interviewId,
          reportId,
        },
        userId,
        queueType: "save-interview-audio-to-s3",
      }),
    });

    // Execute both requests in parallel
    logger.info({ interviewId, reportId }, "Sending parallel requests to API Gateway");
    const [reportResponse, audioResponse] = await Promise.all([reportRequest, audioRequest]);

    // Parse the JSON responses in parallel
    const [reportResponseData, audioResponseData] = await Promise.all([
      reportResponse.json(),
      audioResponse.json(),
    ]);

    logger.info(
      {
        reportStatus: reportResponse.status,
        audioStatus: audioResponse.status,
      },
      "Received responses from API Gateway"
    );

    // Check if either request failed
    if (!reportResponse.ok || !audioResponse.ok) {
      logger.error(
        {
          reportError: reportResponse.ok ? null : reportResponse.statusText,
          reportStatus: reportResponse.status,
          reportBody: reportResponseData,
          audioError: audioResponse.ok ? null : audioResponse.statusText,
          audioStatus: audioResponse.status,
          audioBody: audioResponseData,
        },
        "Failed to queue one or more tasks"
      );

      // Return the first error
      if (!reportResponse.ok) {
        return NextResponse.json(reportResponseData, {
          status: reportResponse.status,
        });
      } else {
        return NextResponse.json(audioResponseData, {
          status: audioResponse.status,
        });
      }
    }

    return NextResponse.json(
      {
        message: "Report generation and audio reconstruction started",
        reportStatus: reportResponse.status,
        audioStatus: audioResponse.status,
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "POST /api/generate");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error queueing report generation"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
