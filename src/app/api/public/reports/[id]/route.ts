import { db } from "@/db";
import { reports } from "@/db/schema";
import { logger } from "@/lib/logger";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  logger.info("GET request received at /api/public/reports/[id]");

  try {
    const reportId = idHandler.decode(params.id);
    const report = await db.query.reports.findFirst({
      where: eq(reports.id, reportId),
      with: {
        pageSettings: true,
        interview: {
          columns: {
            candidate: true,
            role: true,
            company: true,
            transcript: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(formatErrorEntity("Report not found"), {
        status: 404,
      });
    }

    logger.info({ id: report.id }, "Successfully retrieved report");
    return NextResponse.json(formatEntity(report, "report"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/public/reports/[id]");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/public/reports/[id]"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
