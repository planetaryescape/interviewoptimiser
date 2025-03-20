import { formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { countries } from "~/db/schema";
import { logger } from "~/lib/logger";

export async function GET(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    logger.warn("Unauthorized access attempt to GET /api/lookups/countries");
    return NextResponse.json(formatErrorEntity("Unauthorized"), {
      status: 401,
    });
  }

  try {
    const items = await db.select().from(countries);
    logger.info({ count: items.length }, "Successfully retrieved countries");
    return NextResponse.json(formatEntityList(items, "countries"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/lookups/countries");
      scope.setExtra("error", error);

      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/lookups/countries"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
