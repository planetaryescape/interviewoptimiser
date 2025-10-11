"use server";

import { validateFileSize } from "@/lib/utils/fileValidation";
import * as Sentry from "@sentry/nextjs";
import mammoth from "mammoth";
import { extractFromDocument } from "~/lib/ai/extract-from-document";
import { logger } from "~/lib/logger";
import { getOpenAiClient } from "~/lib/openai";

export async function extractTextFromFile(formData: FormData): Promise<string> {
  try {
    const file = formData.get("file") as File;
    logger.info({ file }, "Received file");

    if (!file) {
      throw new Error("No file provided");
    }

    const validation = validateFileSize(file);
    if (!validation.isValid) {
      throw new Error(validation.error || "Invalid file");
    }

    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    const fileBuffer = Buffer.from(uint8Array);

    // Determine extraction type based on file name
    const fileName = file.name.toLowerCase();
    const extractionType =
      fileName.includes("cv") || fileName.includes("resume")
        ? "cv"
        : fileName.includes("job") || fileName.includes("jd")
          ? "job_description"
          : "general";

    // Check if it&apos;s a PDF or image that can be processed by Vision API
    if (
      file.type === "application/pdf" ||
      file.type === "image/png" ||
      file.type === "image/jpeg" ||
      file.type === "image/jpg" ||
      file.type === "image/webp" ||
      file.type === "image/gif"
    ) {
      logger.info(`Starting to extract text from ${file.type}`);

      // Use vision model (gpt-5-mini) for document extraction
      const model = getOpenAiClient()("gpt-5-mini");
      const result = await extractFromDocument({
        model: model as any,
        fileBuffer,
        fileType: file.type,
        extractionType,
      });

      logger.info(
        {
          textLength: result.data?.length,
          method: "vision",
          model: "gpt-5-mini",
          fileType: file.type,
        },
        `Extracted text from ${file.type} using vision model`
      );

      return result.data;
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === "application/msword"
    ) {
      logger.info("starting to extract text from word file");
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      logger.info({ textLength: result.value?.trim().length }, "Extracted text from word file");
      return result.value?.trim();
    }

    throw new Error("Unsupported file type");
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "extractTextFromFile");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error extracting text from file"
    );
    throw error;
  }
}
