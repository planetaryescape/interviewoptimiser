import { db } from "@/db";
import { jobs, organizationMembers } from "@/db/schema";
import { getUserFromClerkId } from "@/lib/auth";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import {
  formatEntity,
  formatEntityList,
  formatErrorEntity,
} from "@/lib/utils/formatEntity";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

async function checkOrganizationAccess(organizationId: number, userId: number) {
  const member = await db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.organizationId, organizationId),
      eq(organizationMembers.userId, userId),
      eq(organizationMembers.isActive, true)
    ),
  });
  return member;
}

export async function GET(request: NextRequest) {
  logger.info("GET request received at /api/jobs");

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.error("Unauthorized access attempt at /api/jobs");
    return NextResponse.json(formatErrorEntity({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId");

  if (!organizationId) {
    logger.error("Missing organization ID", {
      searchParams: Object.fromEntries(searchParams),
    });
    return NextResponse.json(
      formatErrorEntity({ message: "Organization ID is required" }),
      { status: 400 }
    );
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

    const member = await checkOrganizationAccess(
      parseInt(organizationId),
      user.id
    );
    if (!member) {
      logger.error("User not authorized to access organization jobs", {
        userId: user.id,
        organizationId,
      });
      return NextResponse.json(
        formatErrorEntity({
          message: "Not authorized to access this organization's jobs",
        }),
        { status: 403 }
      );
    }

    const organizationJobs = await db.query.jobs.findMany({
      where: and(
        eq(jobs.organizationId, parseInt(organizationId)),
        eq(jobs.isDeleted, false)
      ),
    });

    logger.info("Successfully fetched jobs", {
      userId: user.id,
      organizationId,
      count: organizationJobs.length,
    });

    return NextResponse.json(formatEntityList(organizationJobs, "job"));
  } catch (error) {
    logger.error("Error fetching jobs", { error });
    Sentry.captureException(error);
    return NextResponse.json(formatErrorEntity(error), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  logger.info("POST request received at /api/jobs");

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.error("Unauthorized access attempt at /api/jobs");
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

    const json = await request.json();
    const {
      organizationId,
      title,
      description,
      requirements,
      interviewDuration,
      assessmentCriteria,
    } = json;

    if (!organizationId || !title || !description || !interviewDuration) {
      logger.error("Missing required fields", { json });
      return NextResponse.json(
        formatErrorEntity({ message: "Missing required fields" }),
        { status: 400 }
      );
    }

    const member = await checkOrganizationAccess(organizationId, user.id);
    if (!member || !["owner", "admin"].includes(member.role)) {
      logger.error("User not authorized to create jobs", {
        userId: user.id,
        organizationId,
        role: member?.role,
      });
      return NextResponse.json(
        formatErrorEntity({
          message: "Not authorized to create jobs for this organization",
        }),
        { status: 403 }
      );
    }

    const job = await db.transaction(async (tx) => {
      const [job] = await tx
        .insert(jobs)
        .values({
          organizationId,
          createdById: user.id,
          title,
          description,
          requirements,
          interviewDuration,
          assessmentCriteria,
          shareableLink: ``,
        })
        .returning();

      await tx
        .update(jobs)
        .set({ shareableLink: `${config.baseUrl}/jobs/${job.id}/share` })
        .where(eq(jobs.id, job.id));

      return job;
    });

    logger.info("Successfully created job", {
      userId: user.id,
      organizationId,
      jobId: job.id,
    });

    return NextResponse.json(formatEntity(job, "job"));
  } catch (error) {
    logger.error("Error creating job", { error });
    Sentry.captureException(error);
    return NextResponse.json(formatErrorEntity(error), { status: 500 });
  }
}
