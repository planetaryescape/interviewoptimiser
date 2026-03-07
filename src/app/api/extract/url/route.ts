import { withAuth } from "@/lib/auth-middleware";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import * as Sentry from "@sentry/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { setExtractionResult } from "~/lib/extraction-store";
import { inngest } from "~/lib/inngest";
import { logger } from "~/lib/logger";

export const maxDuration = 60;

const extractUrlRequestSchema = z.object({
  url: z.string().url("Invalid URL format"),
});

export const POST = withAuth(
  async (request: NextRequest, { user }) => {
    logger.info("POST request received at /api/extract/url");

    try {
      if (!user.id) {
        return NextResponse.json(formatErrorEntity("User not found"), { status: 404 });
      }

      const body = await request.json();
      const { url } = extractUrlRequestSchema.parse(body);

      const extractionId = crypto.randomUUID();

      await setExtractionResult(extractionId, { status: "pending" });

      await inngest.send({
        name: "interview/extract-url.requested",
        data: {
          extractionId,
          url,
          userId: user.id,
        },
      });

      logger.info({ userId: user.id, extractionId, url }, "URL extraction dispatched to Inngest");

      return NextResponse.json(formatEntity({ extractionId }, "generic"), { status: 202 });
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "POST /api/extract/url");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });

      logger.error(
        { message: error instanceof Error ? error.message : "Unknown error", error },
        "Error in POST /api/extract/url"
      );

      return NextResponse.json(formatErrorEntity("Failed to extract text from the provided URL"), {
        status: 500,
      });
    }
  },
  { routeName: "POST /api/extract/url" }
);
