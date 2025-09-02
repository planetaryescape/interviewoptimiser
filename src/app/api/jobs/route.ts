import { withAuth } from "@/lib/auth-middleware";
import { CacheDurations, CachePrefixes, CacheTags, cache } from "@/lib/cache";
import { sanitiseUserInputText } from "@/lib/sanitiseUserInputText";
import { formatEntity, formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import * as Sentry from "@sentry/nextjs";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { config } from "~/config";
import { db } from "~/db";
import { jobs } from "~/db/schema";
import { logger } from "~/lib/logger";

export const POST = withAuth(
  async (request, { user }) => {
    logger.info("POST request received at /api/jobs");

    try {
      const body = await request.json();
      const { submittedCVText, jobDescriptionText, additionalInfo, duration, type } = body;
      logger.info("Received job data");

      const [newJob] = await db.transaction(async (tx) => {
        logger.info({}, "Sanitising user input");
        const sanitisedSubmittedCVText = sanitiseUserInputText(submittedCVText, {
          truncate: true,
          maxLength: config.maxTextLengths.cv,
        });
        const sanitisedJobDescriptionText = sanitiseUserInputText(jobDescriptionText, {
          truncate: true,
          maxLength: config.maxTextLengths.jobDescription,
        });
        const sanitisedAdditionalInfo = sanitiseUserInputText(additionalInfo, {
          truncate: true,
          maxLength: config.maxTextLengths.additionalInfo,
        });

        logger.info({}, "Creating new job");
        const [createdJob] = await tx
          .insert(jobs)
          .values({
            userId: user.id,
            submittedCVText: sanitisedSubmittedCVText,
            jobDescriptionText: sanitisedJobDescriptionText,
            additionalInfo: sanitisedAdditionalInfo,
          })
          .returning();

        logger.info({ jobId: createdJob.id }, "Successfully created new job");

        return [createdJob];
      });

      logger.info({ jobId: newJob.id }, "Successfully created new job");

      await cache.invalidatePattern(`jobs:${user.id}`, CachePrefixes.JOB);
      await cache.invalidateByTag(`user-jobs:${user.id}`);

      return NextResponse.json(formatEntity(newJob, "job"), {
        status: 201,
      });
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "POST /api/jobs");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error in POST /api/jobs"
      );
      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "POST /api/jobs" }
);

export const GET = withAuth(
  async (_request, { user }) => {
    logger.info("GET request received at /api/jobs");

    try {
      const cacheKey = `jobs:${user.id}`;

      const userJobs = await cache.wrap(
        cacheKey,
        async () => {
          return await db.query.jobs.findMany({
            where: eq(jobs.userId, user.id),
            orderBy: desc(jobs.createdAt),
            with: {
              interviews: {
                with: {
                  report: true,
                },
              },
              candidateDetails: true,
              jobDescription: true,
            },
          });
        },
        {
          ttl: CacheDurations.SHORT,
          prefix: CachePrefixes.JOB,
          tags: [CacheTags.JOB_DATA, `user-jobs:${user.id}`],
        }
      );

      logger.info({ count: userJobs.length }, "Successfully retrieved jobs");
      return NextResponse.json(formatEntityList(userJobs, "job"));
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "GET /api/jobs");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error in GET /api/jobs"
      );
      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "GET /api/jobs" }
);
