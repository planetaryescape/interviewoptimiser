import { MAX_FILE_SIZE } from "@/lib/constants";

export const MB_IN_BYTES = 1024 * 1024;

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates file size to prevent memory exhaustion
 * @param file The file to validate
 * @param maxSizeInBytes Maximum allowed file size in bytes (defaults to MAX_FILE_SIZE)
 * @returns Validation result with error message if invalid
 */
export function validateFileSize(
  file: File | null | undefined,
  maxSizeInBytes: number = MAX_FILE_SIZE
): FileValidationResult {
  if (!file) {
    return { isValid: false, error: "No file provided" };
  }

  // Allow empty files (size === 0) but reject missing size property
  if (file.size == null) {
    return { isValid: false, error: "Invalid file: size property is missing" };
  }

  if (file.size > maxSizeInBytes) {
    const maxSizeInMB = maxSizeInBytes / MB_IN_BYTES;
    return {
      isValid: false,
      error: `File size exceeds ${maxSizeInMB}MB limit. Please upload a smaller file.`,
    };
  }

  return { isValid: true };
}

/**
 * Gets human-readable file size
 * @param bytes File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}
