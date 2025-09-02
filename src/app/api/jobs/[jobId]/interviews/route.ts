import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { db } from "~/db";
import { interviews } from "~/db/schema";
import { logger } from "~/lib/logger";

export const GET = withAuth<{ jobId: string }>(
  async (_request, { user, params }) => {
    try {
      const jobId = idHandler.decode(params!.jobId);

      const jobInterviews = await db.query.interviews.findMany({
        where: eq(interviews.jobId, jobId),
        with: {
          report: {
            with: {
              pageSettings: true,
            },
          },
        },
        orderBy: (interviews, { desc }) => [desc(interviews.createdAt)],
      });

      logger.info({ jobId, count: jobInterviews.length }, "Successfully retrieved job interviews");
      return NextResponse.json(formatEntityList(jobInterviews, "interview"));
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "GET /api/jobs/[jobId]/interviews");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error in GET /api/jobs/[jobId]/interviews"
      );
      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "GET /api/jobs/[jobId]/interviews" }
);
