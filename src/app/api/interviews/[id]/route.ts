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

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  logger.info("GET request received at /api/interviews/[id]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to GET /api/interviews/[id]");
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

    const interviewId = idHandler.decode(params.id);

    const interview = await db.query.interviews.findFirst({
      where: eq(interviews.id, interviewId),
      with: {
        job: {
          with: {
            jobDescription: true,
            candidateDetails: true,
          },
        },
      },
    });

    if (!interview) {
      return NextResponse.json(formatErrorEntity("Interview not found"), {
        status: 404,
      });
    }

    logger.info({ id: interview.id }, "Successfully retrieved interview");
    return NextResponse.json(formatEntity(interview, "interview"));
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

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  logger.info("PUT request received at /api/interviews/[id]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to PUT /api/interviews/[id]");
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

    const interviewId = idHandler.decode(params.id);
    const interview = await db.query.interviews.findFirst({
      where: eq(interviews.id, interviewId),
    });

    if (!interview) {
      return NextResponse.json(formatErrorEntity("Interview not found"), {
        status: 404,
      });
    }

    const body = await request.json();
    const { transcript, customSessionId, chatGroupId, humeChatId, requestId, actualTime } = body;

    // Ensure required fields are present
    if (!chatGroupId) {
      logger.warn("Missing required field: chatGroupId");
      return NextResponse.json(formatErrorEntity("Missing required field: chatGroupId"), {
        status: 400,
      });
    }

    if (!humeChatId) {
      logger.warn("Missing required field: humeChatId");
      return NextResponse.json(formatErrorEntity("Missing required field: humeChatId"), {
        status: 400,
      });
    }

    const [updatedInterview] = await db
      .update(interviews)
      .set({
        customSessionId,
        chatGroupId,
        humeChatId,
        requestId,
        actualTime,
        transcript,
        updatedAt: new Date(),
      })
      .where(eq(interviews.id, interviewId))
      .returning();

    logger.info({ id: updatedInterview.id }, "Successfully updated interview");
    return NextResponse.json(formatEntity(updatedInterview, "interview"));
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

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  logger.info("DELETE request received at /api/interviews/[id]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to DELETE /api/interviews/[id]");
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

    const interviewId = idHandler.decode(params.id);
    const interview = await db.query.interviews.findFirst({
      where: eq(interviews.id, interviewId),
    });

    if (!interview) {
      return NextResponse.json(formatErrorEntity("Interview not found"), {
        status: 404,
      });
    }

    await db.delete(interviews).where(eq(interviews.id, interviewId));

    logger.info({ id: interview.id }, "Successfully deleted interview");
    return NextResponse.json({ status: "success" });
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
