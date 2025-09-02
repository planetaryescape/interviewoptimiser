import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { CacheDurations, CachePrefixes, CacheTags, cache } from "@/lib/cache";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { db } from "~/db";
import { interviews, jobs, reports } from "~/db/schema";
import { logger } from "~/lib/logger";

export const GET = withAuth<{ jobId: string }>(
  async (_request, { user, params }) => {
    try {
      const jobId = idHandler.decode(params!.jobId);
      const cacheKey = `job:${jobId}`;

      const userJob = await cache.wrap(
        cacheKey,
        async () => {
          return await db.query.jobs.findFirst({
            where: eq(jobs.id, jobId),
            with: {
              candidateDetails: true,
              jobDescription: true,
            },
          });
        },
        {
          ttl: CacheDurations.MEDIUM,
          prefix: CachePrefixes.JOB,
          tags: [CacheTags.JOB_DATA, `job:${jobId}`, `user-jobs:${user.id}`],
        }
      );

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
  },
  { routeName: "GET /api/jobs/[jobId]" }
);

const jobSchema = createInsertSchema(jobs).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const PUT = withAuth<{ jobId: string }>(
  async (request, { user, params }) => {
    try {
      const jobId = idHandler.decode(params!.jobId);
      const body = await request.json();
      const inputJob = jobSchema.partial().parse(body);
      logger.info({ jobId }, "Parsed job input");

      const existingJob = await db.query.jobs.findFirst({
        where: eq(jobs.id, jobId),
      });

      if (!existingJob || existingJob.userId !== user.id) {
        logger.error({ jobId, userId: user.id }, "Job not found or unauthorized");
        return NextResponse.json(
          formatErrorEntity({
            message: "Job not found or unauthorized",
            jobId,
            userId: user.id,
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

      await cache.delete(`job:${jobId}`, CachePrefixes.JOB);
      await cache.invalidatePattern(`jobs:${user.id}`, CachePrefixes.JOB);
      await cache.invalidateByTag(`user-jobs:${user.id}`);

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
  },
  { routeName: "PUT /api/jobs/[jobId]" }
);

export const DELETE = withAuth<{ jobId: string }>(
  async (_request, { user, params }) => {
    try {
      const jobId = idHandler.decode(params!.jobId);

      await db.transaction(async (tx) => {
        const interviewsToDelete = await tx.query.interviews.findMany({
          where: eq(interviews.jobId, jobId),
        });

        for (const interview of interviewsToDelete) {
          await tx.delete(reports).where(eq(reports.interviewId, interview.id));
        }

        // Delete interview
        await tx.delete(interviews).where(eq(interviews.jobId, jobId));

        // Delete job
        const result = await tx.delete(jobs).where(eq(jobs.id, jobId)).returning();

        logger.info({ id: result[0].id }, "Successfully deleted job");
      });

      logger.info({ jobId }, "Successfully deleted job and related data");

      await cache.delete(`job:${jobId}`, CachePrefixes.JOB);
      await cache.invalidatePattern(`jobs:${user.id}`, CachePrefixes.JOB);
      await cache.invalidateByTag(`user-jobs:${user.id}`);

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
  },
  { routeName: "DELETE /api/jobs/[jobId]" }
);
