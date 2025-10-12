import { withAuth } from "@/lib/auth-middleware";
import { encodeJobDescription } from "@/lib/utils/encodeHelpers";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/db";
import { jobDescriptions } from "~/db/schema";
import { logger } from "~/lib/logger";

export const GET = withAuth<{ jobId: string }>(
  async (_request, { user, params }) => {
    try {
      // Decode hash ID to numeric
      const jobId = idHandler.safeDecode(params!.jobId);
      if (jobId === null) {
        return NextResponse.json(formatErrorEntity("Invalid job ID"), {
          status: 404,
        });
      }

      const jobDescription = await db.query.jobDescriptions.findFirst({
        where: eq(jobDescriptions.jobId, jobId),
      });

      if (!jobDescription) {
        return NextResponse.json(formatErrorEntity("Job description not found"), {
          status: 404,
        });
      }

      logger.info({ id: jobDescription.id }, "Successfully retrieved job description");

      // Encode all IDs before sending to client
      const encodedJobDescription = encodeJobDescription(jobDescription);

      return NextResponse.json(formatEntity(encodedJobDescription, "jobDescription"));
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
