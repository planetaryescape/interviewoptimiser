import { logger } from "~/lib/logger";

export function sanitiseUserInputText(
  text: string,
  options: {
    truncate?: boolean;
    maxLength?: number;
  } = { truncate: true, maxLength: 15000 }
): string {
  logger.info({ text: text.slice(0, 60) }, "Sanitising user input text");

  // Remove leading/trailing whitespace
  text = text?.trim();

  // Remove null characters
  text = text.replace(/\u0000/g, "");

  // Remove control characters
  text = text.replace(/[\x00-\x1F\x7F-\x9F]/g, "");

  // Encode HTML special characters
  text = text.replace(/[&<>"']/g, (match) => {
    switch (match) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
    }
    return match;
  });

  // Split text into lines, filter empty lines, and remove duplicates
  const lines = text.split("\n");
  const filteredLines = lines.filter((line: string) => line?.trim() !== "");
  const deduplicatedLines = Array.from(new Set(filteredLines));

  // Replace multiple spaces with a single space, then join lines with a space and trim
  const cleanedContent = deduplicatedLines
    .map((line) => line.replace(/\s\s+/g, " "))
    .join(" ")
    ?.trim();

  if (options.truncate) {
    // Limit the length of the text
    return cleanedContent.slice(0, options.maxLength);
  }

  return cleanedContent;
}
