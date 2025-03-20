import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { interviews, reports } from "~/db/schema";
import { logger } from "~/lib/logger";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ interviewId: string }> }
) {
  const params = await props.params;
  logger.info("GET request received at /api/interviews/[interviewId]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to GET /api/interviews/[interviewId]");
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

    const userInterview = await db.query.interviews.findFirst({
      where: eq(interviews.id, interviewId),
      with: {
        candidateDetails: true,
        jobDescription: true,
      },
    });

    if (!userInterview) {
      return NextResponse.json(formatErrorEntity("Interview not found"), {
        status: 404,
      });
    }

    logger.info({ id: userInterview.id }, "Successfully retrieved interview with report");
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
  props: { params: Promise<{ interviewId: string }> }
) {
  const params = await props.params;
  logger.info("PUT request received at /api/interviews/[interviewId]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to PUT /api/interviews/[interviewId]");
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
    const body = await request.json();
    const inputInterview = interviewSchema.partial().parse(body);
    logger.info({ interviewId }, "Parsed interview input");

    // Ensure the interview belongs to the user
    const existingInterview = await db.query.interviews.findFirst({
      where: eq(interviews.id, interviewId),
    });

    if (!existingInterview || existingInterview.userId !== userId) {
      logger.error({ interviewId, userId }, "Interview not found or unauthorized");
      return NextResponse.json(
        formatErrorEntity({
          message: "Interview not found or unauthorized",
          interviewId,
          userId,
        }),
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
      scope.setExtra("context", "PUT /api/interviews/[interviewId]");
      scope.setExtra("error", error);
      scope.setExtra("params", params);
      scope.setExtra("message", error instanceof Error ? error.message : error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in PUT /api/interviews/[interviewId]"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ interviewId: string }> }
) {
  const params = await props.params;
  logger.info("DELETE request received at /api/interviews/[interviewId]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to DELETE /api/interviews/[interviewId]");
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

    await db.transaction(async (tx) => {
      // Delete report
      await tx.delete(reports).where(eq(reports.interviewId, interviewId));

      // Delete interview
      const result = await tx.delete(interviews).where(eq(interviews.id, interviewId)).returning();

      logger.info({ id: result[0].id }, "Successfully deleted interview");
    });

    logger.info({ interviewId }, "Successfully deleted interview and related data");
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
