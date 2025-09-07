import { withAuth } from "@/lib/auth-middleware";
import { formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/db";
import { interviews, jobs } from "~/db/schema";
import { logger } from "~/lib/logger";

export const GET = withAuth<{ jobId: string }>(
  async (_request, { user, params }) => {
    logger.info("GET request received at /api/jobs/[jobId]/reports");

    try {
      const jobId = idHandler.decode(params!.jobId);

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
          "Unauthorized access attempt to job reports"
        );
        return NextResponse.json(formatErrorEntity("Unauthorized"), {
          status: 403,
        });
      }

      const jobInterviews = await db.query.interviews.findMany({
        where: eq(interviews.jobId, jobId),
        with: {
          report: {
            with: {
              pageSettings: true,
            },
          },
        },
        orderBy: (interviews, { desc }) => [desc(interviews.createdAt)],
      });

      const jobReports = jobInterviews.map((interview) => interview.report);

      logger.info({ jobId, count: jobReports.length }, "Successfully retrieved job reports");

      // Encode IDs before sending to client
      const encodedReports = jobReports
        .filter((report): report is NonNullable<typeof report> => report !== null)
        .map((report) => ({
          ...report,
          id: idHandler.encode(report.id),
          interviewId: idHandler.encode(report.interviewId),
          pageSettings: report.pageSettings
            ? {
                ...report.pageSettings,
                id: idHandler.encode(report.pageSettings.id),
                reportId: report.pageSettings.reportId
                  ? idHandler.encode(report.pageSettings.reportId)
                  : null,
              }
            : null,
        }));

      return NextResponse.json(formatEntityList(encodedReports, "report"));
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "GET /api/jobs/[jobId]/reports");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error in GET /api/jobs/[jobId]/reports"
      );
      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "GET /api/jobs/[jobId]/reports" }
);
