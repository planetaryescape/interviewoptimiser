import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { interviews } from "~/db/schema";
import { logger } from "~/lib/logger";

export async function GET(_: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  logger.info("GET request received at /api/public/interviews/[id]");

  try {
    const interviewId = idHandler.decode(params.id);

    const interview = await db.query.interviews.findFirst({
      where: eq(interviews.id, interviewId),
      with: {
        job: {
          columns: {
            candidate: true,
            role: true,
            company: true,
          },
        },
      },
    });

    if (!interview) {
      return NextResponse.json(formatErrorEntity("Interview not found"), {
        status: 404,
      });
    }

    logger.info({ id: interview.id }, "Successfully retrieved interview");
    return NextResponse.json(formatEntity(interview, "interview"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/public/interviews/[id]");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/public/interviews/[id]"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
