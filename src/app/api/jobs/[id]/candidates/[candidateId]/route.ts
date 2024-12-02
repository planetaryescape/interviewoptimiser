import { db } from "@/db";
import { jobCandidates, jobs, organizationMembers } from "@/db/schema";
import { getUserFromClerkId } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

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

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string; candidateId: string }> }
) {
  const params = await props.params;
  logger.info(
    "PUT request received at /api/jobs/[id]/candidates/[candidateId]",
    { id: params.id, candidateId: params.candidateId }
  );

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.error(
      "Unauthorized access attempt at /api/jobs/[id]/candidates/[candidateId]"
    );
    return NextResponse.json(formatErrorEntity({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const user = await getUserFromClerkId(clerkUserId);
    if (!user || !user.id) {
      logger.error("User not found", { clerkUserId });
      return NextResponse.json(
        formatErrorEntity({ message: "User not found" }),
        { status: 404 }
      );
    }

    const jobId = idHandler.decode(params.id);
    const candidateId = parseInt(params.candidateId);

    const access = await checkJobAccess(jobId, user.id);

    if (!access?.job) {
      logger.error("Job not found", { jobId });
      return NextResponse.json(
        formatErrorEntity({ message: "Job not found" }),
        { status: 404 }
      );
    }

    if (!access.member || !["owner", "admin"].includes(access.member.role)) {
      logger.error("User not authorized to update job candidates", {
        userId: user.id,
        jobId,
        role: access.member?.role,
      });
      return NextResponse.json(
        formatErrorEntity({
          message: "Not authorized to update candidates in this job",
        }),
        { status: 403 }
      );
    }

    const candidate = await db.query.jobCandidates.findFirst({
      where: and(
        eq(jobCandidates.id, candidateId),
        eq(jobCandidates.jobId, jobId),
        eq(jobCandidates.isDeleted, false)
      ),
    });

    if (!candidate) {
      logger.error("Candidate not found", { candidateId, jobId });
      return NextResponse.json(
        formatErrorEntity({ message: "Candidate not found" }),
        { status: 404 }
      );
    }

    const json = await request.json();
    const { status, cvUrl, notes } = json;

    if (!status && !cvUrl && !notes) {
      logger.error("No fields to update", { json });
      return NextResponse.json(
        formatErrorEntity({ message: "No fields to update" }),
        { status: 400 }
      );
    }

    if (
      status &&
      ![
        "applied",
        "screening",
        "interviewing",
        "offer",
        "hired",
        "rejected",
      ].includes(status)
    ) {
      logger.error("Invalid status", { status });
      return NextResponse.json(
        formatErrorEntity({
          message:
            "Invalid status. Must be one of: applied, screening, interviewing, offer, hired, rejected",
        }),
        { status: 400 }
      );
    }

    const [updatedCandidate] = await db
      .update(jobCandidates)
      .set({
        ...(status && { status }),
        ...(cvUrl && { cvUrl }),
        ...(notes && { notes }),
        updatedAt: new Date(),
      })
      .where(eq(jobCandidates.id, candidateId))
      .returning();

    logger.info("Successfully updated job candidate", {
      userId: user.id,
      jobId,
      candidateId,
      updates: { status, cvUrl, notes },
    });

    return NextResponse.json(formatEntity(updatedCandidate, "job-candidate"));
  } catch (error) {
    logger.error("Error updating job candidate", { error });
    Sentry.captureException(error);
    return NextResponse.json(formatErrorEntity(error), { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string; candidateId: string }> }
) {
  const params = await props.params;
  logger.info(
    "DELETE request received at /api/jobs/[id]/candidates/[candidateId]",
    { id: params.id, candidateId: params.candidateId }
  );

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.error(
      "Unauthorized access attempt at /api/jobs/[id]/candidates/[candidateId]"
    );
    return NextResponse.json(formatErrorEntity({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const user = await getUserFromClerkId(clerkUserId);
    if (!user || !user.id) {
      logger.error("User not found", { clerkUserId });
      return NextResponse.json(
        formatErrorEntity({ message: "User not found" }),
        { status: 404 }
      );
    }

    const jobId = idHandler.decode(params.id);
    const candidateId = idHandler.decode(params.candidateId);

    const access = await checkJobAccess(jobId, user.id);

    if (!access?.job) {
      logger.error("Job not found", { jobId });
      return NextResponse.json(
        formatErrorEntity({ message: "Job not found" }),
        { status: 404 }
      );
    }

    if (!access.member || !["owner", "admin"].includes(access.member.role)) {
      logger.error("User not authorized to remove job candidates", {
        userId: user.id,
        jobId,
        role: access.member?.role,
      });
      return NextResponse.json(
        formatErrorEntity({
          message: "Not authorized to remove candidates from this job",
        }),
        { status: 403 }
      );
    }

    const candidate = await db.query.jobCandidates.findFirst({
      where: and(
        eq(jobCandidates.id, candidateId),
        eq(jobCandidates.jobId, jobId),
        eq(jobCandidates.isDeleted, false)
      ),
    });

    if (!candidate) {
      logger.error("Candidate not found", { candidateId, jobId });
      return NextResponse.json(
        formatErrorEntity({ message: "Candidate not found" }),
        { status: 404 }
      );
    }

    // Soft delete
    const [updatedCandidate] = await db
      .update(jobCandidates)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(eq(jobCandidates.id, candidateId))
      .returning();

    logger.info("Successfully removed job candidate", {
      userId: user.id,
      jobId,
      candidateId,
    });

    return NextResponse.json(formatEntity(updatedCandidate, "job-candidate"));
  } catch (error) {
    logger.error("Error removing job candidate", { error });
    Sentry.captureException(error);
    return NextResponse.json(formatErrorEntity(error), { status: 500 });
  }
}
