import { describe, expect, it } from "vitest";
import { parseIdParam, parsePositiveInteger } from "./index";

describe("parseIdParam", () => {
  it("should parse valid numeric strings", () => {
    expect(parseIdParam("123")).toBe(123);
    expect(parseIdParam("1")).toBe(1);
    expect(parseIdParam("999999")).toBe(999999);
  });

  it("should throw error for null or undefined values", () => {
    expect(() => parseIdParam(null)).toThrow("ID is required");
    expect(() => parseIdParam(undefined)).toThrow("ID is required");
    expect(() => parseIdParam("")).toThrow("ID is required");
  });

  it("should throw error for non-numeric strings", () => {
    expect(() => parseIdParam("abc")).toThrow("Invalid ID: must be a valid number");
    expect(() => parseIdParam(" ")).toThrow("Invalid ID: must be a valid number");
    expect(() => parseIdParam("NaN")).toThrow("Invalid ID: must be a valid number");
  });

  it("should parse valid integers from strings with additional characters", () => {
    expect(parseIdParam("12.34")).toBe(12);
    expect(parseIdParam("12abc")).toBe(12);
  });

  it("should throw error for zero or negative numbers", () => {
    expect(() => parseIdParam("0")).toThrow("Invalid ID: must be a positive number");
    expect(() => parseIdParam("-1")).toThrow("Invalid ID: must be a positive number");
    expect(() => parseIdParam("-100")).toThrow("Invalid ID: must be a positive number");
  });

  it("should use custom field name in error messages", () => {
    expect(() => parseIdParam(null, "jobId")).toThrow("jobId is required");
    expect(() => parseIdParam("abc", "organizationId")).toThrow(
      "Invalid organizationId: must be a valid number"
    );
    expect(() => parseIdParam("0", "userId")).toThrow("Invalid userId: must be a positive number");
  });
});

describe("parsePositiveInteger", () => {
  it("should parse valid numeric strings", () => {
    expect(parsePositiveInteger("123", "value")).toBe(123);
    expect(parsePositiveInteger("456", "count")).toBe(456);
    expect(parsePositiveInteger("1", "minutes")).toBe(1);
  });

  it("should allow zero when allowZero is true", () => {
    expect(parsePositiveInteger("0", "minutes", true)).toBe(0);
  });

  it("should reject zero when allowZero is false", () => {
    expect(() => parsePositiveInteger("0", "count", false)).toThrow(
      "Invalid count: must be positive"
    );
  });

  it("should reject null values", () => {
    expect(() => parsePositiveInteger(null, "value")).toThrow("value is required");
  });

  it("should reject undefined values", () => {
    expect(() => parsePositiveInteger(undefined, "value")).toThrow("value is required");
  });

  it("should reject empty strings", () => {
    expect(() => parsePositiveInteger("", "value")).toThrow("value is required");
  });

  it("should reject non-numeric strings", () => {
    expect(() => parsePositiveInteger("abc", "value")).toThrow(
      "Invalid value: must be a valid number"
    );
    expect(() => parsePositiveInteger("test123", "value")).toThrow(
      "Invalid value: must be a valid number"
    );
  });

  it("should reject negative numbers", () => {
    expect(() => parsePositiveInteger("-5", "value")).toThrow("Invalid value: must be positive");
    expect(() => parsePositiveInteger("-5", "value", true)).toThrow(
      "Invalid value: must be non-negative"
    );
  });

  it("should parse integers from decimal strings", () => {
    expect(parsePositiveInteger("12.34", "value")).toBe(12);
    expect(parsePositiveInteger("12.99", "value")).toBe(12);
  });

  it("should parse integers from strings with trailing text", () => {
    expect(parsePositiveInteger("12abc", "value")).toBe(12);
  });
});
