import * as Sentry from "@sentry/nextjs";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import { db } from "~/db";
import { jobs } from "~/db/schema";
import { logger } from "~/lib/logger";

export const GET = withAuth(
  async (_request, { user }) => {
    try {
      const { role } = user;
      if (!user.id) {
        logger.warn({ userId: user.id }, "User not found in database");
        return NextResponse.json(formatErrorEntity("User not found"), {
          status: 404,
        });
      }

      if (role !== "admin") {
        logger.warn({ userId: user.id }, "Unauthorized access attempt to GET /api/admin/jobs");
        return NextResponse.json(formatErrorEntity("Unauthorized"), {
          status: 401,
        });
      }

      const userJobs = await db.query.jobs.findMany({
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

      logger.info({ count: userJobs.length }, "Successfully retrieved jobs");
      return NextResponse.json(formatEntityList(userJobs, "job"));
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "GET /api/admin/jobs");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error in GET /api/admin/jobs"
      );
      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "GET /api/admin/jobs" }
);
