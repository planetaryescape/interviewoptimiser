import { db } from "@/db";
import { cvs } from "@/db/schema";
import { logger } from "@/lib/logger";
import { formatErrorEntity } from "@/lib/utils/formatEntity";
import * as Sentry from "@sentry/serverless";
import { count } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  logger.info("GET request received at /api/public/cvs/count");

  try {
    const [result] = await db.select({ count: count() }).from(cvs);

    logger.info({ count: result.count }, "Successfully retrieved CV count");
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/public/cvs/count");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/public/cvs/count"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
