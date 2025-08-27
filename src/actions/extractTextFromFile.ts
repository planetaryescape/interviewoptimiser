"use server";

import { validateFileSize } from "@/lib/utils/fileValidation";
import * as Sentry from "@sentry/nextjs";
import mammoth from "mammoth";
import pdf from "pdf-parse";
import { logger } from "~/lib/logger";

export async function extractTextFromFile(formData: FormData): Promise<string> {
  try {
    const file = formData.get("file") as File;
    logger.info({ file }, "Received file");

    const validation = validateFileSize(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
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
