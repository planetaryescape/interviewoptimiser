import { db } from "@/db";
import { reports } from "@/db/schema";
import { getUserFromClerkId } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ interviewId: string }> }
) {
  logger.info("GET request received at /api/interviews/[interviewId]/reports");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn(
      "Unauthorized access attempt to GET /api/interviews/[interviewId]/reports"
    );
    return NextResponse.json(formatErrorEntity("Unauthorized"), {
      status: 401,
    });
  }

  try {
    const params = await props.params;
    const { id: userId } = await getUserFromClerkId(clerkUserId);
    if (!userId) {
      logger.warn({ clerkUserId }, "User not found in database");
      return NextResponse.json(formatErrorEntity("User not found"), {
        status: 404,
      });
    }

    const interviewId = idHandler.decode(params.interviewId);

    const interviewReports = await db.query.reports.findMany({
      where: eq(reports.interviewId, interviewId),
      with: {
        pageSettings: true,
      },
      orderBy: (reports, { desc }) => [desc(reports.createdAt)],
    });

    logger.info(
      { interviewId, count: interviewReports.length },
      "Successfully retrieved interview reports"
    );
    return NextResponse.json(formatEntityList(interviewReports, "report"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/interviews/[interviewId]/reports");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/interviews/[interviewId]/reports"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
