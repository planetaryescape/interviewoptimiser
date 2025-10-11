import { withAuth } from "@/lib/auth-middleware";
import { cleanUpText } from "@/lib/clean-up-text";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import * as Sentry from "@sentry/nextjs";
import { load } from "cheerio";
import { type NextRequest, NextResponse } from "next/server";
import TurndownService from "turndown";
import { z } from "zod";
import { logger } from "~/lib/logger";

export const maxDuration = 60; // 60 seconds timeout for URL fetching

const extractUrlRequestSchema = z.object({
  url: z.string().url("Invalid URL format"),
});

export const POST = withAuth(
  async (request: NextRequest, { user }) => {
    logger.info("POST request received at /api/extract/url");

    try {
      if (!user.id) {
        logger.warn({ userId: user.id }, "User not found in database");
        return NextResponse.json(formatErrorEntity("User not found"), {
          status: 404,
        });
      }

      const body = await request.json();
      const { url } = extractUrlRequestSchema.parse(body);

      logger.info({ userId: user.id, url }, "Starting URL extraction");

      // Fetch the URL
      const response = await fetch(url);
      if (!response.ok) {
        logger.warn({ userId: user.id, url, status: response.status }, "Failed to fetch URL");
        return NextResponse.json(
          formatErrorEntity("Failed to fetch the URL. Please check the URL and try again."),
          { status: 400 }
        );
      }

      const html = await response.text();
      logger.info({ userId: user.id }, "Extracted HTML from URL");

      // Parse HTML
      const $ = load(html);

      // Remove unnecessary elements
      $(
        "script, style, header, footer, nav, aside, noscript, iframe, img, video, audio, svg, canvas"
      ).remove();

      // Get the cleaned body content
      const bodyContent = $("body").html() || "";
      const cleanedContent = cleanUpText($(bodyContent).text());

      // Convert HTML to Markdown
      const turndownService = new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced",
      });
      const markdown = turndownService.turndown(cleanedContent);

      logger.info(
        {
          userId: user.id,
          url,
          extractedLength: markdown.length,
        },
        "URL extraction completed successfully"
      );

      return NextResponse.json(
        formatEntity(
          {
            extractedText: markdown,
            url,
            characterCount: markdown.length,
          },
          "generic"
        )
      );
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "POST /api/extract/url");
        scope.setExtra("error", error);
        scope.setExtra("message", error instanceof Error ? error.message : error);
        Sentry.captureException(error);
      });

      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error in POST /api/extract/url"
      );

      return NextResponse.json(formatErrorEntity("Failed to extract text from the provided URL"), {
        status: 500,
      });
    }
  },
  { routeName: "POST /api/extract/url" }
);
