import { describe, expect, it } from "vitest";
import { formatFileSize, MB_IN_BYTES, validateFileSize } from "./fileValidation";

describe("validateFileSize", () => {
  it("should reject null file", () => {
    const result = validateFileSize(null);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("No file provided");
  });

  it("should reject undefined file", () => {
    const result = validateFileSize(undefined);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("No file provided");
  });

  it("should reject file with null size", () => {
    const file = new File([""], "test.txt");
    Object.defineProperty(file, "size", { value: null });
    const result = validateFileSize(file);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Invalid file: size property is missing");
  });

  it("should reject file with undefined size", () => {
    const file = new File([""], "test.txt");
    Object.defineProperty(file, "size", { value: undefined });
    const result = validateFileSize(file);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Invalid file: size property is missing");
  });

  it("should accept empty file (size = 0)", () => {
    const file = new File([], "empty.txt");
    expect(file.size).toBe(0);
    const result = validateFileSize(file);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should accept file within size limit", () => {
    const content = "a".repeat(5 * MB_IN_BYTES); // 5MB
    const file = new File([content], "test.pdf");
    const result = validateFileSize(file);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should reject file exceeding default size limit", () => {
    const content = "a".repeat(11 * MB_IN_BYTES); // 11MB
    const file = new File([content], "large.pdf");
    const result = validateFileSize(file);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("File size exceeds 10MB limit. Please upload a smaller file.");
  });

  it("should use custom size limit when provided", () => {
    const content = "a".repeat(3 * MB_IN_BYTES); // 3MB
    const file = new File([content], "test.pdf");

    // Should fail with 2MB limit
    const result1 = validateFileSize(file, 2 * MB_IN_BYTES);
    expect(result1.isValid).toBe(false);
    expect(result1.error).toBe("File size exceeds 2MB limit. Please upload a smaller file.");

    // Should pass with 5MB limit
    const result2 = validateFileSize(file, 5 * MB_IN_BYTES);
    expect(result2.isValid).toBe(true);
    expect(result2.error).toBeUndefined();
  });

  it("should handle exact size limit", () => {
    const content = "a".repeat(10 * MB_IN_BYTES); // Exactly 10MB
    const file = new File([content], "exact.pdf");
    const result = validateFileSize(file);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

describe("formatFileSize", () => {
  it("should format 0 bytes", () => {
    expect(formatFileSize(0)).toBe("0 Bytes");
  });

  it("should format bytes", () => {
    expect(formatFileSize(512)).toBe("512 Bytes");
    expect(formatFileSize(1023)).toBe("1023 Bytes");
  });

  it("should format KB", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(2048)).toBe("2 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });

  it("should format MB", () => {
    expect(formatFileSize(1024 * 1024)).toBe("1 MB");
    expect(formatFileSize(5.5 * 1024 * 1024)).toBe("5.5 MB");
    expect(formatFileSize(10 * 1024 * 1024)).toBe("10 MB");
  });

  it("should format GB", () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe("1 GB");
    expect(formatFileSize(2.75 * 1024 * 1024 * 1024)).toBe("2.75 GB");
  });
});
