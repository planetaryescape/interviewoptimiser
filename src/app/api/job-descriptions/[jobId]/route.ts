import { withAuth } from "@/lib/auth-middleware";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/db";
import { jobDescriptions } from "~/db/schema";
import { logger } from "~/lib/logger";

export const GET = withAuth<{ jobId: string }>(
  async (request, { user, params }) => {
    try {
      const jobId = idHandler.decode(params!.jobId);

      const jobDescription = await db.query.jobDescriptions.findFirst({
        where: eq(jobDescriptions.jobId, jobId),
      });

      if (!jobDescription) {
        return NextResponse.json(formatErrorEntity("Job description not found"), {
          status: 404,
        });
      }

      logger.info({ id: jobDescription.id }, "Successfully retrieved job description");
      return NextResponse.json(formatEntity(jobDescription, "jobDescription"));
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "GET /api/job-descriptions/[jobId]");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error in GET /api/job-descriptions/[jobId]"
      );
      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "GET /api/job-descriptions/[jobId]" }
);
