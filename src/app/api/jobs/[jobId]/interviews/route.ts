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
  logger.info("GET request received at /api/jobs/[jobId]/interviews");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to GET /api/jobs/[jobId]/interviews");
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

    logger.info({ jobId, count: jobInterviews.length }, "Successfully retrieved job interviews");
    return NextResponse.json(formatEntityList(jobInterviews, "interview"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/jobs/[jobId]/interviews");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/jobs/[jobId]/interviews"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
