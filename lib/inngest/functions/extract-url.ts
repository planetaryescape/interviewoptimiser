import { cleanUpText } from "@/lib/clean-up-text";
import { load } from "cheerio";
import TurndownService from "turndown";
import { setExtractionResult } from "~/lib/extraction-store";
import { inngest } from "~/lib/inngest";
import { logger } from "~/lib/logger";
import { validateUrlForFetch } from "~/lib/utils/validate-url";

export const extractUrlFn = inngest.createFunction(
  {
    id: "extract-url",
    retries: 2,
    concurrency: [{ limit: 5 }],
    onFailure: async ({ error, event }) => {
      const extractionId = event.data.event.data.extractionId;
      logger.error({ error: error.message, extractionId }, "URL extraction failed after retries");
      await setExtractionResult(extractionId, {
        status: "error",
        error: "Failed to extract text from URL. Please try pasting the content manually.",
      });
    },
  },
  { event: "interview/extract-url.requested" },
  async ({ event, step }) => {
    const { extractionId, url, userId } = event.data;

    // Step 1: Validate and fetch URL
    const html = await step.run("fetch-url", async () => {
      // Defense in depth: re-validate even though API route already checked
      const { valid, url: safeUrl, error } = validateUrlForFetch(url);
      if (!valid || !safeUrl) {
        throw new Error(`URL blocked by SSRF protection: ${error}`);
      }

      const response = await fetch(safeUrl, {
        redirect: "follow",
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status}`);
      }
      return response.text();
    });

    // Step 2: Extract text
    const extractedText = await step.run("extract-text", async () => {
      const $ = load(html);
      $(
        "script, style, header, footer, nav, aside, noscript, iframe, img, video, audio, svg, canvas"
      ).remove();

      const bodyContent = $("body").html() || "";
      const cleanedContent = cleanUpText($(bodyContent).text());

      const turndownService = new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced",
      });
      return turndownService.turndown(cleanedContent);
    });

    // Step 3: Broadcast result
    await step.run("broadcast-result", async () => {
      await setExtractionResult(extractionId, {
        status: "completed",
        extractedText,
        url,
        characterCount: extractedText.length,
      });
    });

    return { extractionId, textLength: extractedText.length };
  }
);
