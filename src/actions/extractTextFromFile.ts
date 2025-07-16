"use server";

import { MAX_FILE_SIZE } from "@/lib/constants";
import * as Sentry from "@sentry/nextjs";
import mammoth from "mammoth";
import { logger } from "~/lib/logger";

// @ts-expect-error TODO: fix this
import * as pdf from "pdf-parse/lib/pdf-parse.js";

export async function extractTextFromFile(formData: FormData): Promise<string> {
  try {
    const file = formData.get("file") as File;
    logger.info({ file }, "Received file");
    if (!file) {
      throw new Error("No file provided");
    }

    if (!file.size || typeof file.size !== "number") {
      throw new Error("Invalid file: missing or invalid size property");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)} MB limit`);
    }

    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    if (file.type === "application/pdf") {
      logger.info("starting to extract text from PDF");
      const buffer = Buffer.from(uint8Array);
      const data = await pdf(buffer);
      logger.info({ textLength: data.text?.trim().length }, "Extracted text from PDF");
      return data.text?.trim();
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === "application/msword"
    ) {
      logger.info("starting to extract text from word file");
      const buffer = Buffer.from(uint8Array);
      const result = await mammoth.extractRawText({ buffer });
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
