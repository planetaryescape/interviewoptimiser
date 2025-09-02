import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { CacheDurations, CachePrefixes, cache } from "@/lib/cache";
import { CacheProfiles, setCacheHeaders } from "@/lib/cache-headers";
import { formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import { db } from "~/db";
import { countries } from "~/db/schema";
import { logger } from "~/lib/logger";

export const GET = withAuth(
  async (_request, { user }) => {
    try {
      const items = await cache.wrap(
        "countries:all",
        async () => {
          return await db.select().from(countries);
        },
        {
          ttl: CacheDurations.DAY,
          prefix: CachePrefixes.LOOKUP,
        }
      );

      logger.info({ count: items.length }, "Successfully retrieved countries");

      const response = NextResponse.json(formatEntityList(items, "countries"));
      return setCacheHeaders(response, CacheProfiles.LOOKUP_DATA);
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
  },
  { routeName: "GET /api/lookups/countries" }
);
