import * as Sentry from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { parseIdParam } from "@/lib/utils";
import { formatEntity, formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { db } from "~/db";
import { interviews, jobs } from "~/db/schema";
import { logger } from "~/lib/logger";

export const POST = withAuth(
  async (request, { user }) => {
    try {
      const body = await request.json();
      const {
        customSessionId,
        chatGroupId,
        humeChatId,
        requestId,
        jobId: jobIdString,
        type,
        duration,
        keyQuestions,
      } = body;

      if (!jobIdString) {
        logger.warn("Missing required field: jobId");
        return NextResponse.json(formatErrorEntity("Missing required field: jobId"), {
          status: 400,
        });
      }

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

      const existingInterview = await db.query.interviews.findFirst({
        where: and(eq(interviews.humeChatId, humeChatId)),
      });

      const jobId = idHandler.decode(jobIdString);

      if (existingInterview) {
        logger.info({ jobId }, "Interview already exists");
        return NextResponse.json(formatEntity(existingInterview, "interview"), {
          status: 200,
        });
      }

      const [newInterview] = await db
        .insert(interviews)
        .values({
          jobId,
          customSessionId,
          chatGroupId,
          humeChatId,
          requestId,
          type,
          keyQuestions,
          duration,
        })
        .returning();

      logger.info({ id: newInterview.id }, "Successfully created interview");

      return NextResponse.json(formatEntity(newInterview, "interview"), {
        status: 201,
      });
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "POST /api/interviews");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error in POST /api/interviews"
      );
      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "POST /api/interviews" }
);

export const GET = withAuth(
  async (request, { user }) => {
    try {
      const { role } = user;
      if (!user.id) {
        logger.warn({ userId: user.id }, "User not found in database");
        return NextResponse.json(formatErrorEntity("User not found"), {
          status: 404,
        });
      }

      const url = new URL(request.url);
      const jobId = url.searchParams.get("jobId");

      if (!jobId) {
        logger.info("No jobId provided, getting all interviews");
        return NextResponse.json(formatErrorEntity("Missing jobId"), {
          status: 400,
        });
      }

      // Check if the job exists and belongs to the user
      let parsedJobId: number;
      try {
        parsedJobId = parseIdParam(jobId, "jobId");
      } catch (error) {
        logger.warn({ jobId, error }, "Invalid jobId format");
        return NextResponse.json(
          formatErrorEntity(error instanceof Error ? error.message : "Invalid jobId"),
          {
            status: 400,
          }
        );
      }

      const job = await db.query.jobs.findFirst({
        where: eq(jobs.id, parsedJobId),
      });

      if (!job) {
        logger.warn({ jobId }, "Job not found");
        return NextResponse.json(formatErrorEntity("Job not found"), {
          status: 404,
        });
      }

      if (job.userId !== user.id && role !== "admin") {
        logger.warn({ jobId }, "Unauthorized access to job");
        return NextResponse.json(formatErrorEntity("Unauthorized"), {
          status: 401,
        });
      }

      const returnedInterviews = await db.query.interviews.findMany({
        where: eq(interviews.jobId, parsedJobId),
      });

      if (!returnedInterviews) {
        logger.info({ jobId }, "No interviews found for this job");
        return NextResponse.json(formatEntityList([], "generic"));
      }

      logger.info({ jobId }, "Successfully retrieved interviews for job");

      return NextResponse.json(formatEntityList(returnedInterviews, "interview"));
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "GET /api/interviews");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error in GET /api/interviews"
      );
      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "GET /api/interviews" }
);
