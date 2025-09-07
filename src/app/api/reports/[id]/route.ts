import { withAuth } from "@/lib/auth-middleware";
import { CacheDurations, CachePrefixes, CacheTags, cache } from "@/lib/cache";
import { CacheProfiles, setCacheHeaders } from "@/lib/cache-headers";
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
      const reportId = idHandler.decode(params!.id);
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

      // Encode IDs before sending to client
      const encodedReport = {
        ...userReport,
        id: idHandler.encode(userReport.id),
        interviewId: idHandler.encode(userReport.interviewId),
        pageSettings: userReport.pageSettings
          ? {
              ...userReport.pageSettings,
              id: idHandler.encode(userReport.pageSettings.id),
              reportId: userReport.pageSettings.reportId
                ? idHandler.encode(userReport.pageSettings.reportId)
                : null,
            }
          : null,
        interview: {
          ...userReport.interview,
          id: idHandler.encode(userReport.interview.id),
          jobId: idHandler.encode(userReport.interview.jobId),
          job: {
            ...userReport.interview.job,
            // Note: Only userId is included in the query columns
          },
        },
      };

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
