import { getUserFromClerkId } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

const API_GATEWAY_URL =
  "https://fexjbopvxf.execute-api.eu-west-2.amazonaws.com/prod/add-to-queue";

const API_KEY = process.env.INTERVIEWOPTIMISER_API_KEY;

export async function POST(req: NextRequest) {
  try {
    logger.info("Received request at /api/optimize");
    const { optimizationId: optimizationIdString } = await req.json();
    const optimizationId = idHandler.decode(optimizationIdString);
    logger.info({ optimizationId }, "Optimization ID");

    const { userId: clerkUserId } = getAuth(req);
    if (!clerkUserId) {
      logger.error("Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, minutes } = await getUserFromClerkId(clerkUserId);
    if (!userId) {
      logger.error("User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (minutes && minutes <= 0) {
      logger.error("Not enough minutes");
      return NextResponse.json(
        { error: "Not enough minutes" },
        { status: 403 }
      );
    }

    logger.info(
      { optimizationId, url: API_GATEWAY_URL },
      "Sending message to API Gateway"
    );

    const response = await fetch(API_GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY || "",
      },
      body: JSON.stringify({
        optimizationId,
        queueType: "optimise-cv",
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
          requestBody: { optimizationId, queueType: "optimise-cv" },
        },
        "Failed to queue optimization"
      );
      return NextResponse.json(responseData, { status: response.status });
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "POST /api/optimise");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error queueing CV optimization"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
