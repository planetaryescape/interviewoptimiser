import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { chats, jobs, reports } from "~/db/schema";
import { logger } from "~/lib/logger";

export async function GET(request: NextRequest, props: { params: Promise<{ jobId: string }> }) {
  const params = await props.params;
  logger.info("GET request received at /api/jobs/[jobId]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to GET /api/jobs/[jobId]");
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

    const jobId = idHandler.decode(params.jobId);

    const userJob = await db.query.jobs.findFirst({
      where: eq(jobs.id, jobId),
      with: {
        candidateDetails: true,
        jobDescription: true,
      },
    });

    if (!userJob) {
      return NextResponse.json(formatErrorEntity("Job not found"), {
        status: 404,
      });
    }

    logger.info({ id: userJob.id }, "Successfully retrieved job");
    return NextResponse.json(formatEntity(userJob, "job"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/jobs/[id]");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/jobs/[id]"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}

const jobSchema = createInsertSchema(jobs).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export async function PUT(request: NextRequest, props: { params: Promise<{ jobId: string }> }) {
  const params = await props.params;
  logger.info("PUT request received at /api/jobs/[jobId]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to PUT /api/jobs/[jobId]");
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

    const jobId = idHandler.decode(params.jobId);
    const body = await request.json();
    const inputJob = jobSchema.partial().parse(body);
    logger.info({ jobId }, "Parsed job input");

    const existingJob = await db.query.jobs.findFirst({
      where: eq(jobs.id, jobId),
    });

    if (!existingJob || existingJob.userId !== userId) {
      logger.error({ jobId, userId }, "Job not found or unauthorized");
      return NextResponse.json(
        formatErrorEntity({
          message: "Job not found or unauthorized",
          jobId,
          userId,
        }),
        {
          status: 404,
        }
      );
    }

    const { ...remainingJob } = inputJob;

    const [updatedResult] = await db.transaction(async (tx) => {
      const [updatedJob] = await tx
        .update(jobs)
        .set({
          ...remainingJob,
        })
        .where(eq(jobs.id, jobId))
        .returning();

      return [updatedJob];
    });

    logger.info({ id: updatedResult.id }, "Successfully updated job");
    return NextResponse.json(formatEntity(updatedResult, "job"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "PUT /api/jobs/[jobId]");
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
      "Error in PUT /api/jobs/[jobId]"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ jobId: string }> }) {
  const params = await props.params;
  logger.info("DELETE request received at /api/jobs/[jobId]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to DELETE /api/jobs/[jobId]");
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

    const jobId = idHandler.decode(params.jobId);

    await db.transaction(async (tx) => {
      const chatsToDelete = await tx.query.chats.findMany({
        where: eq(chats.jobId, jobId),
      });

      for (const chat of chatsToDelete) {
        await tx.delete(reports).where(eq(reports.chatId, chat.id));
      }

      // Delete chat
      await tx.delete(chats).where(eq(chats.jobId, jobId));

      // Delete job
      const result = await tx.delete(jobs).where(eq(jobs.id, jobId)).returning();

      logger.info({ id: result[0].id }, "Successfully deleted job");
    });

    logger.info({ jobId }, "Successfully deleted job and related data");
    return NextResponse.json({ message: "Job deleted successfully" });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "DELETE /api/jobs/[id]");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in DELETE /api/jobs/[id]"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
