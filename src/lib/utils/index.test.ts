import { describe, expect, it } from "vitest";
import { parseIdParam } from "./index";

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
