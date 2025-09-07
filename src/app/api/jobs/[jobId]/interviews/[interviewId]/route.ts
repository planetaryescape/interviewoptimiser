import { withAuth } from "@/lib/auth-middleware";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/db";
import { interviews } from "~/db/schema";
import { logger } from "~/lib/logger";

export const GET = withAuth<{ jobId: string; interviewId: string }>(
  async (_request, { user, params }) => {
    try {
      const interviewId = idHandler.decode(params!.interviewId);

      const jobInterview = await db.query.interviews.findFirst({
        where: eq(interviews.id, interviewId),
        with: {
          report: {
            with: {
              pageSettings: true,
            },
          },
        },
      });

      if (!jobInterview) {
        return NextResponse.json(formatErrorEntity("Interview not found"), {
          status: 404,
        });
      }

      logger.info(
        { id: jobInterview.id },
        "Successfully retrieved interview with report and page settings"
      );

      // Encode IDs before sending to client
      const encodedInterview = {
        ...jobInterview,
        id: idHandler.encode(jobInterview.id),
        jobId: idHandler.encode(jobInterview.jobId),
        report: jobInterview.report
          ? {
              ...jobInterview.report,
              id: idHandler.encode(jobInterview.report.id),
              interviewId: idHandler.encode(jobInterview.report.interviewId),
              pageSettings: jobInterview.report.pageSettings
                ? {
                    ...jobInterview.report.pageSettings,
                    id: idHandler.encode(jobInterview.report.pageSettings.id),
                    reportId: jobInterview.report.pageSettings.reportId
                      ? idHandler.encode(jobInterview.report.pageSettings.reportId)
                      : null,
                  }
                : null,
            }
          : null,
      };

      return NextResponse.json(formatEntity(encodedInterview, "interview"));
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "GET /api/jobs/[jobId]/interviews/[interviewId]");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error in GET /api/jobs/[jobId]/interviews/[interviewId]"
      );
      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "GET /api/jobs/[jobId]/interviews/[interviewId]" }
);
