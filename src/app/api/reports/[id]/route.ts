import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { reports } from "~/db/schema";
import { logger } from "~/lib/logger";

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  logger.info("GET request received at /api/reports/[id]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to GET /api/reports/[id]");
    return NextResponse.json(formatErrorEntity("Unauthorized"), {
      status: 401,
    });
  }

  try {
    const { id: userId } = await getUserFromClerkId(clerkUserId);
    if (!userId) {
      logger.warn({ clerkUserId }, "User not found in database");
      return NextResponse.json(formatErrorEntity("User not found"), {
        status: 404,
      });
    }

    const reportId = idHandler.decode(params.id);

    const userReport = await db.query.reports.findFirst({
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

    if (!userReport) {
      return NextResponse.json(formatErrorEntity("Report not found"), {
        status: 404,
      });
    }

    // Verify ownership through the job
    if (userReport.interview.job.userId !== userId) {
      logger.warn(
        { reportId, userId, jobUserId: userReport.interview.job.userId },
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
}
