import { getUserFromClerkId } from "@/lib/auth";
import { formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { interviews } from "~/db/schema";
import { logger } from "~/lib/logger";

export async function GET(request: NextRequest, props: { params: Promise<{ jobId: string }> }) {
  logger.info("GET request received at /api/jobs/[jobId]/reports");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to GET /api/jobs/[jobId]/reports");
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

    const jobId = idHandler.decode(params.jobId);

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
    return NextResponse.json(formatEntityList(jobReports, "report"));
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
}
