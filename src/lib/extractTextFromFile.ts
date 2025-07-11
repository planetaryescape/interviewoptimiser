"use server";

import mammoth from "mammoth";
// @ts-expect-error TODO: fix this
import * as pdf from "pdf-parse/lib/pdf-parse.js";
import { logger } from "../../lib/logger";

export async function extractTextFromFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(buffer);

  if (file.type === "application/pdf") {
    const buffer = Buffer.from(uint8Array);
    try {
      const data = await pdf(buffer);
      logger.info({ textLength: data.text?.trim().length }, "Extracted text from PDF");
      return data.text?.trim() || "";
    } catch (error) {
      logger.error({ error }, "Error parsing PDF");
      throw new Error("Error parsing PDF");
    }
  } else if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.type === "application/msword"
  ) {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  }

  throw new Error("Unsupported file type");
}
