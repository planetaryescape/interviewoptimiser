import { encodeReport } from "@/lib/utils/encodeHelpers";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { reports } from "~/db/schema";
import { logger } from "~/lib/logger";

export async function GET(_: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  logger.info("GET request received at /api/public/reports/[id]");

  try {
    // Decode hash ID to numeric
    const reportId = idHandler.safeDecode(params.id);
    if (reportId === null) {
      return NextResponse.json(formatErrorEntity("Invalid report ID"), {
        status: 404,
      });
    }

    const report = await db.query.reports.findFirst({
      where: eq(reports.id, reportId),
      with: {
        pageSettings: true,
        interview: {
          with: {
            job: true,
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

    // Encode all IDs before sending to client
    const encodedReport = encodeReport(report);
    return NextResponse.json(formatEntity(encodedReport, "report"));
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
