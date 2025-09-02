"use server";

import * as Sentry from "@sentry/nextjs";
import { load } from "cheerio";
import TurndownService from "turndown";
import { cleanUpText } from "@/lib/clean-up-text";
import { logger } from "~/lib/logger";

export async function extractTextFromUrl(url: string): Promise<string> {
  try {
    // check if url is valid
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch the URL");
    }
    const html = await response.text();
    logger.info("Extracted HTML from URL");

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

    return markdown;
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "extractTextFromUrl");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error extracting text from URL"
    );
    throw new Error("Failed to extract text from the provided URL");
  }
}
