import { withAuth } from "@/lib/auth-middleware";
import { encodeInterview } from "@/lib/utils/encodeHelpers";
import { formatEntity, formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
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

      // Decode hash ID to numeric
      const jobId = idHandler.safeDecode(jobIdString);
      if (jobId === null) {
        return NextResponse.json(formatErrorEntity("Invalid job ID"), {
          status: 400,
        });
      }

      const existingInterview = await db.query.interviews.findFirst({
        where: and(eq(interviews.humeChatId, humeChatId)),
      });

      if (existingInterview) {
        logger.info({ jobId }, "Interview already exists");

        // Encode all IDs before sending to client
        const encodedInterview = encodeInterview(existingInterview);

        return NextResponse.json(formatEntity(encodedInterview, "interview"), {
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

      // Encode all IDs before sending to client
      const encodedInterview = encodeInterview(newInterview);

      return NextResponse.json(formatEntity(encodedInterview, "interview"), {
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
      const jobIdString = url.searchParams.get("jobId");

      if (!jobIdString) {
        logger.info("No jobId provided, getting all interviews");
        return NextResponse.json(formatErrorEntity("Missing jobId"), {
          status: 400,
        });
      }

      // Decode hash ID to numeric
      const jobId = idHandler.safeDecode(jobIdString);
      if (jobId === null) {
        logger.warn({ jobId: jobIdString }, "Invalid jobId format");
        return NextResponse.json(formatErrorEntity("Invalid job ID"), {
          status: 400,
        });
      }

      // Check if the job exists and belongs to the user
      const job = await db.query.jobs.findFirst({
        where: eq(jobs.id, jobId),
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
        where: eq(interviews.jobId, jobId),
      });

      if (!returnedInterviews) {
        logger.info({ jobId }, "No interviews found for this job");
        return NextResponse.json(formatEntityList([], "generic"));
      }

      logger.info({ jobId }, "Successfully retrieved interviews for job");

      // Encode all IDs before sending to client
      const encodedInterviews = returnedInterviews.map(encodeInterview);

      return NextResponse.json(formatEntityList(encodedInterviews, "interview"));
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
