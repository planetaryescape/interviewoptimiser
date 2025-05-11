import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { jobCandidates, jobs, organizationMembers, users } from "~/db/schema";
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
  logger.info("GET request received at /api/jobs/[id]/candidates", {
    id: params.id,
  });

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.error("Unauthorized access attempt at /api/jobs/[id]/candidates");
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
      logger.error("User not authorized to access job candidates", {
        userId: user.id,
        jobId,
      });
      return NextResponse.json(
        formatErrorEntity({
          message: "Not authorized to access this job's candidates",
        }),
        { status: 403 }
      );
    }

    const candidates = await db
      .select({
        id: jobCandidates.id,
        userId: jobCandidates.userId,
        status: jobCandidates.status,
        cvUrl: jobCandidates.cvUrl,
        notes: jobCandidates.notes,
        createdAt: jobCandidates.createdAt,
        updatedAt: jobCandidates.updatedAt,
        username: users.username,
        email: users.email,
        firstname: users.firstname,
        lastname: users.lastname,
      })
      .from(jobCandidates)
      .innerJoin(users, eq(jobCandidates.userId, users.id))
      .where(and(eq(jobCandidates.jobId, jobId), eq(jobCandidates.isDeleted, false)));

    logger.info("Successfully fetched job candidates", {
      userId: user.id,
      jobId,
      count: candidates.length,
    });

    return NextResponse.json(formatEntityList(candidates, "job-candidate"));
  } catch (error) {
    logger.error("Error fetching job candidates", { error });
    Sentry.captureException(error);
    return NextResponse.json(formatErrorEntity(error), { status: 500 });
  }
}

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  logger.info("POST request received at /api/jobs/[id]/candidates", {
    id: params.id,
  });

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.error("Unauthorized access attempt at /api/jobs/[id]/candidates");
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
      logger.error("User not authorized to add job candidates", {
        userId: user.id,
        jobId,
        role: access.member?.role,
      });
      return NextResponse.json(
        formatErrorEntity({
          message: "Not authorized to add candidates to this job",
        }),
        { status: 403 }
      );
    }

    const json = await request.json();
    const { email, cvUrl, notes } = json;

    if (!email) {
      logger.error("Missing required fields", { json });
      return NextResponse.json(formatErrorEntity({ message: "Email is required" }), {
        status: 400,
      });
    }

    const candidate = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!candidate) {
      logger.error("Candidate not found", { email });
      return NextResponse.json(formatErrorEntity({ message: "Candidate not found" }), {
        status: 404,
      });
    }

    const existingCandidate = await db.query.jobCandidates.findFirst({
      where: and(eq(jobCandidates.jobId, jobId), eq(jobCandidates.userId, candidate.id)),
    });

    if (existingCandidate) {
      if (!existingCandidate.isDeleted) {
        logger.error("Candidate is already added to this job", { email });
        return NextResponse.json(
          formatErrorEntity({
            message: "Candidate is already added to this job",
          }),
          { status: 400 }
        );
      }

      // Reactivate candidacy
      const [updatedCandidate] = await db
        .update(jobCandidates)
        .set({
          isDeleted: false,
          cvUrl,
          notes,
          updatedAt: new Date(),
        })
        .where(eq(jobCandidates.id, existingCandidate.id))
        .returning();

      logger.info("Successfully reactivated job candidate", {
        userId: user.id,
        jobId,
        candidateId: updatedCandidate.id,
      });

      return NextResponse.json(formatEntity(updatedCandidate, "job-candidate"));
    }

    const [newCandidate] = await db
      .insert(jobCandidates)
      .values({
        jobId,
        userId: candidate.id,
        cvUrl,
        notes,
      })
      .returning();

    logger.info("Successfully added job candidate", {
      userId: user.id,
      jobId,
      candidateId: newCandidate.id,
    });

    return NextResponse.json(formatEntity(newCandidate, "job-candidate"));
  } catch (error) {
    logger.error("Error adding job candidate", { error });
    Sentry.captureException(error);
    return NextResponse.json(formatErrorEntity(error), { status: 500 });
  }
}
