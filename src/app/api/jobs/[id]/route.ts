import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { jobs, organizationMembers } from "~/db/schema";
import { logger } from "~/lib/logger";

async function checkJobAccess(jobId: number, userId: number) {
  const job = await db.query.jobs.findFirst({
    where: and(eq(jobs.id, jobId), eq(jobs.isDeleted, false)),
  });

  if (!job) return null;

  const member = await db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.organizationId, job.organizationId),
      eq(organizationMembers.userId, userId),
      eq(organizationMembers.isActive, true)
    ),
  });

  return { job, member };
}

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  logger.info("GET request received at /api/jobs/[id]", { id: params.id });

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.error("Unauthorized access attempt at /api/jobs/[id]");
    return NextResponse.json(formatErrorEntity({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const user = await getUserFromClerkId(clerkUserId);
    if (!user || !user.id) {
      logger.error("User not found", { clerkUserId });
      return NextResponse.json(formatErrorEntity({ message: "User not found" }), { status: 404 });
    }

    const jobId = idHandler.decode(params.id);
    const access = await checkJobAccess(jobId, user.id);

    if (!access?.job) {
      logger.error("Job not found", { jobId });
      return NextResponse.json(formatErrorEntity({ message: "Job not found" }), { status: 404 });
    }

    if (!access.member) {
      logger.error("User not authorized to access job", {
        userId: user.id,
        jobId,
      });
      return NextResponse.json(
        formatErrorEntity({ message: "Not authorized to access this job" }),
        { status: 403 }
      );
    }

    logger.info("Successfully fetched job", {
      userId: user.id,
      jobId,
    });

    return NextResponse.json(formatEntity(access.job, "job"));
  } catch (error) {
    logger.error("Error fetching job", { error });
    Sentry.captureException(error);
    return NextResponse.json(formatErrorEntity(error), { status: 500 });
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  logger.info("PUT request received at /api/jobs/[id]", { id: params.id });

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.error("Unauthorized access attempt at /api/jobs/[id]");
    return NextResponse.json(formatErrorEntity({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const user = await getUserFromClerkId(clerkUserId);
    if (!user || !user.id) {
      logger.error("User not found", { clerkUserId });
      return NextResponse.json(formatErrorEntity({ message: "User not found" }), { status: 404 });
    }

    const jobId = idHandler.decode(params.id);
    const access = await checkJobAccess(jobId, user.id);

    if (!access?.job) {
      logger.error("Job not found", { jobId });
      return NextResponse.json(formatErrorEntity({ message: "Job not found" }), { status: 404 });
    }

    if (!access.member || !["owner", "admin"].includes(access.member.role)) {
      logger.error("User not authorized to update job", {
        userId: user.id,
        jobId,
        role: access.member?.role,
      });
      return NextResponse.json(
        formatErrorEntity({ message: "Not authorized to update this job" }),
        { status: 403 }
      );
    }

    const json = await request.json();
    const { title, description, requirements, interviewDuration, assessmentCriteria, status } =
      json;

    if (!title || !description || !interviewDuration) {
      logger.error("Missing required fields", { json });
      return NextResponse.json(formatErrorEntity({ message: "Missing required fields" }), {
        status: 400,
      });
    }

    const [job] = await db
      .update(jobs)
      .set({
        title,
        description,
        requirements,
        interviewDuration,
        assessmentCriteria,
        status,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId))
      .returning();

    logger.info("Successfully updated job", {
      userId: user.id,
      jobId,
    });

    return NextResponse.json(formatEntity(job, "job"));
  } catch (error) {
    logger.error("Error updating job", { error });
    Sentry.captureException(error);
    return NextResponse.json(formatErrorEntity(error), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  logger.info("DELETE request received at /api/jobs/[id]", { id: params.id });

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.error("Unauthorized access attempt at /api/jobs/[id]");
    return NextResponse.json(formatErrorEntity({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const user = await getUserFromClerkId(clerkUserId);
    if (!user || !user.id) {
      logger.error("User not found", { clerkUserId });
      return NextResponse.json(formatErrorEntity({ message: "User not found" }), { status: 404 });
    }

    const jobId = idHandler.decode(params.id);
    const access = await checkJobAccess(jobId, user.id);

    if (!access?.job) {
      logger.error("Job not found", { jobId });
      return NextResponse.json(formatErrorEntity({ message: "Job not found" }), { status: 404 });
    }

    if (!access.member || !["owner", "admin"].includes(access.member.role)) {
      logger.error("User not authorized to delete job", {
        userId: user.id,
        jobId,
        role: access.member?.role,
      });
      return NextResponse.json(
        formatErrorEntity({ message: "Not authorized to delete this job" }),
        { status: 403 }
      );
    }

    const [job] = await db
      .update(jobs)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId))
      .returning();

    logger.info("Successfully deleted job", {
      userId: user.id,
      jobId,
    });

    return NextResponse.json(formatEntity(job, "job"));
  } catch (error) {
    logger.error("Error deleting job", { error });
    Sentry.captureException(error);
    return NextResponse.json(formatErrorEntity(error), { status: 500 });
  }
}
