"use server";

import mammoth from "mammoth";
import { PdfReader } from "pdfreader";
import { logger } from "./logger";

export async function extractTextFromFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(buffer);

  if (file.type === "application/pdf") {
    const buffer = Buffer.from(uint8Array);
    let text = "";
    new PdfReader().parseBuffer(buffer, (err, item) => {
      if (err) {
        logger.error({ err }, "Error parsing PDF");
        throw new Error("Error parsing PDF");
      } else if (!item) {
        logger.warn("end of buffer");
      } else if (item.text) {
        text += item.text;
      }
    });

    return text;
  } else if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.type === "application/msword"
  ) {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  }

  throw new Error("Unsupported file type");
}
