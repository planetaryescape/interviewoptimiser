import { db } from "@/db";
import { reviews } from "@/db/schema";
import { logger } from "@/lib/logger";
import { formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import * as Sentry from "@sentry/nextjs";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  logger.info("GET request received at /api/public/reviews");

  try {
    const publicReviews = await db.query.reviews.findMany({
      where: and(
        eq(reviews.showOnLanding, true),
        eq(reviews.isPublished, true)
      ),
      orderBy: [desc(reviews.createdAt)],
    });

    console.log("publicReviews:", publicReviews);

    logger.info(
      { count: publicReviews.length },
      "Successfully retrieved public reviews"
    );
    return NextResponse.json(formatEntityList(publicReviews, "review"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/public/reviews");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/public/reviews"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
