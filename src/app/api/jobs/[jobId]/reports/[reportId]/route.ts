import { withAuth } from "@/lib/auth-middleware";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/db";
import { jobs, reports } from "~/db/schema";
import { logger } from "~/lib/logger";

export const GET = withAuth<{ jobId: string; reportId: string }>(
  async (_request, { user, params }) => {
    try {
      const jobId = idHandler.decode(params!.jobId);
      const reportId = idHandler.decode(params!.reportId);

      // Verify job ownership
      const job = await db.query.jobs.findFirst({
        where: eq(jobs.id, jobId),
      });

      if (!job) {
        logger.warn({ jobId }, "Job not found");
        return NextResponse.json(formatErrorEntity("Job not found"), {
          status: 404,
        });
      }

      if (job.userId !== user.id) {
        logger.warn(
          { jobId, userId: user.id, jobUserId: job.userId },
          "Unauthorized access attempt to job report"
        );
        return NextResponse.json(formatErrorEntity("Unauthorized"), {
          status: 403,
        });
      }

      const userReport = await db.query.reports.findFirst({
        where: eq(reports.id, reportId),
        with: {
          pageSettings: true,
          interview: true,
        },
      });

      if (!userReport) {
        return NextResponse.json(formatErrorEntity("Report not found"), {
          status: 404,
        });
      }

      // Verify that the report belongs to the specified job
      if (userReport.interview.jobId !== jobId) {
        logger.warn(
          { reportId, jobId, actualJobId: userReport.interview.jobId },
          "Report does not belong to the specified job"
        );
        return NextResponse.json(formatErrorEntity("Report not found"), {
          status: 404,
        });
      }

      logger.info({ id: userReport.id }, "Successfully retrieved report with page settings");
      return NextResponse.json(formatEntity(userReport, "report"));
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "GET /api/jobs/[jobId]/reports/[reportId]");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error in GET /api/jobs/[jobId]/reports/[reportId]"
      );
      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "GET /api/jobs/[jobId]/reports/[reportId]" }
);
