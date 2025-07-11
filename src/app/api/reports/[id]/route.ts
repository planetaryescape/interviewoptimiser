import { withAuth } from "@/lib/auth-middleware";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/db";
import { reports } from "~/db/schema";
import { logger } from "~/lib/logger";

export const GET = withAuth<{ id: string }>(
  async (request, { user, params }) => {
    logger.info("GET request received at /api/reports/[id]");

    try {
      const reportId = idHandler.decode(params!.id);

      const userReport = await db.query.reports.findFirst({
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
      return NextResponse.json(formatEntity(userReport, "report"));
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
