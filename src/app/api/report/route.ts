import { getUserFromClerkId } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

const API_GATEWAY_URL =
  "https://u9e5mrk1j8.execute-api.eu-west-2.amazonaws.com/prod/add-to-queue";

const API_KEY = process.env.INTERVIEWOPTIMISER_API_KEY;

export async function POST(req: NextRequest) {
  try {
    logger.info("Received request at /api/report");
    const { interviewId: interviewIdString } = await req.json();
    const interviewId = idHandler.decode(interviewIdString);
    logger.info({ interviewId }, "Interview ID for report generation");

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

    logger.info(
      { interviewId, url: API_GATEWAY_URL },
      "Sending message to API Gateway"
    );
    const response = await fetch(API_GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY || "",
      },
      body: JSON.stringify({
        interviewId,
        userId,
        queueType: "generate-report",
      }),
    });

    const responseData = await response.json();

    logger.info(
      { status: response.status, responseData },
      "Received response from API Gateway"
    );

    if (!response.ok) {
      logger.error(
        {
          error: response.statusText,
          status: response.status,
          body: responseData,
        },
        "Failed to queue report generation"
      );
      return NextResponse.json(responseData, { status: response.status });
    }

    return NextResponse.json(
      { message: "Report generation started" },
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
