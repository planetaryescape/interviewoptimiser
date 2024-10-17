import { db } from "@/db";
import { interviews } from "@/db/schema";
import { getUserFromClerkId } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/serverless";
import { desc, eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  logger.info("GET request received at /api/interviews/[id]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to GET /api/interviews/[id]");
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

    const interviewId = idHandler.decode(params.id);

    const userInterview = await db.query.interviews.findFirst({
      orderBy: desc(interviews.createdAt),
      where: eq(interviews.id, interviewId),
    });

    logger.info({ id: userInterview?.id }, "Successfully retrieved interview");
    return NextResponse.json(formatEntity(userInterview, "interview"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/interviews/[id]");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/interviews/[id]"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}

const interviewSchema = createInsertSchema(interviews).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  logger.info("PUT request received at /api/interviews/[id]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to PUT /api/interviews/[id]");
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

    const interviewId = idHandler.decode(params.id);
    const body = await request.json();
    const inputInterview = interviewSchema.partial().parse(body);
    logger.info({ inputInterview }, "Parsed interview input");

    // Ensure the interview belongs to the user
    const existingInterview = await db.query.interviews.findFirst({
      where: eq(interviews.id, interviewId),
    });

    if (!existingInterview || existingInterview.userId !== userId) {
      logger.warn(
        { interviewId, userId },
        "Interview not found or unauthorized"
      );
      return NextResponse.json(
        formatErrorEntity("Interview not found or unauthorized"),
        {
          status: 404,
        }
      );
    }

    const { ...remainingInterview } = inputInterview;

    const [updatedResult] = await db.transaction(async (tx) => {
      const [updatedInterview] = await tx
        .update(interviews)
        .set({
          ...remainingInterview,
        })
        .where(eq(interviews.id, interviewId))
        .returning();

      return [updatedInterview];
    });

    logger.info({ id: updatedResult.id }, "Successfully updated interview");
    return NextResponse.json(formatEntity(updatedResult, "interview"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "PUT /api/interviews/[id]");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in PUT /api/interviews/[id]"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  logger.info("DELETE request received at /api/interviews/[id]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to DELETE /api/interviews/[id]");
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

    const interviewId = idHandler.decode(params.id);

    await db.transaction(async (tx) => {
      // Delete interview
      const result = await tx
        .delete(interviews)
        .where(eq(interviews.id, interviewId))
        .returning();

      if (result.length === 0) {
        throw new Error("Interview not found");
      }
    });

    logger.info(
      { interviewId },
      "Successfully deleted interview and related data"
    );
    return NextResponse.json({ message: "Interview deleted successfully" });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "DELETE /api/interviews/[id]");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in DELETE /api/interviews/[id]"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
