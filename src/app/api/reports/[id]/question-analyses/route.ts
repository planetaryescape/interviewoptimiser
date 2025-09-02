import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { db } from "~/db";
import { questionAnalysis, reports } from "~/db/schema";
import { logger } from "~/lib/logger";

/**
 * Retrieves question analyses for a specific report
 */
export const GET = withAuth<{ id: string }>(
  async (_request, { user, params }) => {
    try {
      const { role } = user;
      if (!user.id) {
        logger.warn({ userId: user.id }, "User not found in database");
        return NextResponse.json(formatErrorEntity("User not found"), {
          status: 404,
        });
      }

      // Decode the report ID from the URL parameter
      const reportId = idHandler.decode(params!.id);

      // First, verify that the report exists and belongs to the user
      const report = await db.query.reports.findFirst({
        where: eq(reports.id, reportId),
        with: {
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

      if (!report) {
        logger.warn({ reportId }, "Report not found");
        return NextResponse.json(formatErrorEntity("Report not found"), {
          status: 404,
        });
      }

      // Verify that the report's job belongs to the requesting user
      if (report.interview.job.userId !== user.id && role !== "admin") {
        logger.warn(
          { reportId, userId: user.id },
          "Unauthorized access attempt to report question analyses"
        );
        return NextResponse.json(formatErrorEntity("Unauthorized"), {
          status: 403,
        });
      }

      // Get question analyses for the report
      const analyses = await db.query.questionAnalysis.findMany({
        where: eq(questionAnalysis.reportId, reportId),
      });

      logger.info({ reportId, count: analyses.length }, "Successfully retrieved question analyses");
      return NextResponse.json(formatEntityList(analyses, "question-analysis"));
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "GET /api/reports/[id]/question-analyses");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error in GET /api/reports/[id]/question-analyses"
      );
      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "GET /api/reports/[id]/question-analyses" }
);
