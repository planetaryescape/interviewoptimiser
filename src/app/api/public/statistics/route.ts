import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { db } from "~/db";
import { statistics } from "~/db/schema";
import { logger } from "~/lib/logger";

// Define cache control options
export const revalidate = 3600; // Revalidate every hour (3600 seconds)

export async function GET() {
  logger.info("GET request received at /api/public/statistics");

  try {
    const stats = await db
      .select()
      .from(statistics)
      .then((result) => result[0]);

    if (!stats) {
      logger.warn("No statistics found in database");
      return NextResponse.json(formatErrorEntity("No statistics found"), {
        status: 404,
      });
    }

    logger.info(
      {
        usersCount: stats?.usersCount,
        interviewsCount: stats?.interviewsCount,
        minutesCount: stats?.minutesCount,
      },
      "Successfully retrieved statistics"
    );

    // Create response with the formatted statistics data
    const response = NextResponse.json(formatEntity(stats, "statistics"));

    // Set cache control headers
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );

    return response;
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/public/statistics");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });

    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/public/statistics"
    );

    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
