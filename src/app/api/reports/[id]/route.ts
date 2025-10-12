import { withAuth } from "@/lib/auth-middleware";
import { CacheDurations, CachePrefixes, CacheTags, cache } from "@/lib/cache";
import { CacheProfiles, setCacheHeaders } from "@/lib/cache-headers";
import { encodeReport } from "@/lib/utils/encodeHelpers";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/db";
import { reports } from "~/db/schema";
import { logger } from "~/lib/logger";

export const GET = withAuth<{ id: string }>(
  async (_request, { user, params }) => {
    logger.info("GET request received at /api/reports/[id]");

    try {
      // Decode hash ID to numeric
      const reportId = idHandler.safeDecode(params!.id);
      if (reportId === null) {
        return NextResponse.json(formatErrorEntity("Invalid report ID"), {
          status: 404,
        });
      }

      const cacheKey = `report:${reportId}`;

      const userReport = await cache.wrap(
        cacheKey,
        async () => {
          return await db.query.reports.findFirst({
            where: eq(reports.id, reportId),
            with: {
              pageSettings: true,
              interview: {
                with: {
                  job: {
                    columns: {
                      userId: true,
                    },
                  },
                },
              },
            },
          });
        },
        {
          ttl: CacheDurations.LONG,
          prefix: CachePrefixes.REPORT,
          tags: [CacheTags.REPORT_DATA, `report:${reportId}`, `user-reports:${user.id}`],
        }
      );

      if (!userReport) {
        // Return 403 instead of 404 to avoid leaking information about report existence
        logger.warn({ reportId }, "Report not found or unauthorized access");
        return NextResponse.json(formatErrorEntity("Unauthorized"), {
          status: 403,
        });
      }

      // Verify ownership through the job
      if (userReport.interview.job.userId !== user.id) {
        logger.warn(
          { reportId, userId: user.id, jobUserId: userReport.interview.job.userId },
          "Unauthorized access attempt to report"
        );
        return NextResponse.json(formatErrorEntity("Unauthorized"), {
          status: 403,
        });
      }

      logger.info({ id: userReport.id }, "Successfully retrieved report");

      // Encode all IDs before sending to client
      const encodedReport = encodeReport(userReport);

      const response = NextResponse.json(formatEntity(encodedReport, "report"));
      return setCacheHeaders(response, CacheProfiles.REPORT_DATA);
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "GET /api/reports/[id]");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error in GET /api/reports/[id]"
      );
      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "GET /api/reports/[id]" }
);
