import { getUserFromClerkId } from "@/lib/auth";
import { formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { desc } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { interviews } from "~/db/schema";
import { logger } from "~/lib/logger";

export async function GET(request: NextRequest) {
  logger.info("GET request received at /api/admin/interviews");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to GET /api/admin/interviews");
    return NextResponse.json(formatErrorEntity("Unauthorized"), {
      status: 401,
    });
  }

  try {
    const { id: userId, role } = await getUserFromClerkId(clerkUserId);
    if (!userId) {
      logger.warn({ clerkUserId }, "User not found in database");
      return NextResponse.json(formatErrorEntity("User not found"), {
        status: 404,
      });
    }

    if (role !== "admin") {
      logger.warn({ clerkUserId }, "Unauthorized access attempt to GET /api/admin/interviews");
      return NextResponse.json(formatErrorEntity("Unauthorized"), {
        status: 401,
      });
    }

    const userInterviews = await db.query.interviews.findMany({
      orderBy: desc(interviews.createdAt),
      with: {
        report: true,
      },
    });

    logger.info({ count: userInterviews.length }, "Successfully retrieved interviews");
    return NextResponse.json(formatEntityList(userInterviews, "interview"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/admin/interviews");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/admin/interviews"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
