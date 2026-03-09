import mammoth from "mammoth";
import { extractFromDocument } from "~/lib/ai/extract-from-document";
import { getModelForOperation } from "~/lib/ai/models";
import { setExtractionResult } from "~/lib/extraction-store";
import { getCachedFileExtraction, setCachedFileExtraction } from "~/lib/file-extraction-cache";
import { inngest } from "~/lib/inngest";
import { logger } from "~/lib/logger";

export const extractFileFn = inngest.createFunction(
  {
    id: "extract-file",
    retries: 2,
    concurrency: [{ limit: 5 }],
    throttle: {
      limit: 5,
      period: "1m",
      key: "event.data.userId",
    },
    onFailure: async ({ error, event }) => {
      const extractionId = event.data.event.data.extractionId;
      logger.error({ error: error.message, extractionId }, "File extraction failed after retries");
      await setExtractionResult(extractionId, {
        status: "error",
        error: "Failed to extract text from file. Please try pasting the content manually.",
      });
    },
  },
  { event: "interview/extract-file.requested" },
  async ({ event, step }) => {
    const { extractionId, fileBase64, fileName, fileType, fileSize, fileHash, userId, userEmail } =
      event.data;

    // Step 1: Check cache
    const cached = await step.run("check-cache", async () => {
      return getCachedFileExtraction(fileHash);
    });

    if (cached) {
      await step.run("broadcast-cached", async () => {
        await setExtractionResult(extractionId, {
          status: "completed",
          extractedText: cached.extractedText,
          fileName,
          fileType,
          characterCount: cached.extractedText.length,
          cached: true,
        });
      });
      return { cached: true, extractionId };
    }

    // Step 2: Extract text
    const extractedText = await step.run("extract-text", async () => {
      const fileBuffer = Buffer.from(fileBase64, "base64");

      const fileNameLower = fileName.toLowerCase();
      const extractionType =
        fileNameLower.includes("cv") || fileNameLower.includes("resume")
          ? "cv"
          : fileNameLower.includes("job") || fileNameLower.includes("jd")
            ? "job_description"
            : "general";

      if (fileType === "application/pdf" || fileType.startsWith("image/")) {
        const model = getModelForOperation("extract_from_document", userEmail);
        const result = await extractFromDocument({
          model,
          fileBuffer,
          fileType,
          userEmail,
          extractionType,
        });
        return result.data;
      }

      if (
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileType === "application/msword"
      ) {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        return result.value?.trim() || "";
      }

      throw new Error(`Unsupported file type: ${fileType}`);
    });

    // Step 3: Cache result
    await step.run("cache-result", async () => {
      await setCachedFileExtraction({
        fileHash,
        fileType,
        fileName,
        fileSize,
        extractedText,
        extractionType: "general",
      });
    });

    // Step 4: Broadcast result
    await step.run("broadcast-result", async () => {
      await setExtractionResult(extractionId, {
        status: "completed",
        extractedText,
        fileName,
        fileType,
        characterCount: extractedText.length,
        cached: false,
      });
    });

    return { extractionId, textLength: extractedText.length };
  }
);
