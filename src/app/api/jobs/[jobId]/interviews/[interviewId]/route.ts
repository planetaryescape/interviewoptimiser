import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { interviews } from "~/db/schema";
import { logger } from "~/lib/logger";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ jobId: string; interviewId: string }> }
) {
  const params = await props.params;
  logger.info("GET request received at /api/jobs/[jobId]/interviews/[interviewId]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to GET /api/jobs/[jobId]/interviews/[interviewId]");
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

    const interviewId = idHandler.decode(params.interviewId);

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
    return NextResponse.json(formatEntity(jobInterview, "interview"));
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
}
