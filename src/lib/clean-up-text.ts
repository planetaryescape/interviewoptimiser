export function cleanUpText(text: string): string {
  const lines = text.split("\n");
  const filteredLines = lines.filter((line: string) => line.trim() !== "");
  const deduplicatedLines = Array.from(new Set(filteredLines));
  const cleanedContent = deduplicatedLines
    .join("\n")
    .replace(/\s\s+/g, " ")
    .trim();
  return cleanedContent;
}
