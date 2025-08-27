import { beforeEach, describe, expect, it, vi } from "vitest";
// Import the actual modules but spy on the functions
import { logger } from "~/lib/logger";
import { extractCandidateDetails } from "../extract-candidate-details";
import { mockCV, mockOptimiseModel, mockUsage } from "./test-utils";

// Spy on the logger functions
vi.spyOn(logger, "info");
vi.spyOn(logger, "error");

// Mock the generateObject function
vi.mock("ai", () => ({
  generateObject: vi.fn().mockImplementation(async ({ prompt, schema }) => {
    if (prompt.includes("error")) {
      throw new Error("AI generation failed");
    }

    if (prompt.includes("invalid json")) {
      throw new Error("JSON parsing failed");
    }

    if (prompt.includes("API Error")) {
      throw new Error("API Error");
    }

    if (prompt.includes("Network Error")) {
      throw new Error("Network Error: Failed to fetch");
    }

    if (prompt.includes("Invalid input")) {
      throw new Error("Invalid input CV JSON");
    }

    return {
      object: {
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "+44 7123 456789",
        location: "London, UK",
        currentRole: "Senior Software Engineer",
        professionalSummary:
          "Experienced software engineer with 8+ years in full-stack development",
        linkedinUrl: "https://linkedin.com/in/johnsmith",
        portfolioUrl: "https://johnsmith.dev",
        otherUrls: ["https://github.com/johnsmith"],
      },
      usage: {
        promptTokens: mockUsage.prompt_tokens,
        completionTokens: mockUsage.completion_tokens,
        totalTokens: mockUsage.total_tokens,
      },
    };
  }),
  NoObjectGeneratedError: class NoObjectGeneratedError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AI_NoObjectGeneratedError";
    }
  },
}));

describe("extractCandidateDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully extract candidate details", async () => {
    const result = await extractCandidateDetails({
      model: mockOptimiseModel,
      submittedCVText: JSON.stringify(mockCV),
    });

    expect(result.data).toBeDefined();
    expect(result.data.name).toBe("John Smith");
    expect(result.data.email).toBe("john.smith@example.com");
    expect(result.data.phone).toBe("+44 7123 456789");
    expect(result.usage).toEqual({
      prompt_tokens: mockUsage.prompt_tokens,
      completion_tokens: mockUsage.completion_tokens,
      total_tokens: mockUsage.total_tokens,
    });
    expect(logger.info).toHaveBeenCalledWith("Extracting candidate details from CV");
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("should throw error with invalid results", async () => {
    const { generateObject } = await import("ai");

    // Override generateObject to return validation error
    vi.mocked(generateObject).mockRejectedValueOnce(
      new Error("Validation error: email must be a valid email")
    );

    await expect(
      extractCandidateDetails({
        model: mockOptimiseModel,
        submittedCVText: JSON.stringify(mockCV),
      })
    ).rejects.toThrow("Validation error: email must be a valid email");

    expect(logger.error).toHaveBeenCalled();
  });

  it("should throw error with AI generation errors", async () => {
    await expect(
      extractCandidateDetails({
        model: mockOptimiseModel,
        submittedCVText: "error",
      })
    ).rejects.toThrow("AI generation failed");

    expect(logger.error).toHaveBeenCalled();
  });

  it("should throw error with parsing errors", async () => {
    await expect(
      extractCandidateDetails({
        model: mockOptimiseModel,
        submittedCVText: "invalid json",
      })
    ).rejects.toThrow("JSON parsing failed");

    expect(logger.error).toHaveBeenCalled();
  });

  it("should throw error with API errors", async () => {
    await expect(
      extractCandidateDetails({
        model: mockOptimiseModel,
        submittedCVText: "API Error",
      })
    ).rejects.toThrow("API Error");

    expect(logger.error).toHaveBeenCalled();
  });

  it("should throw error with network errors", async () => {
    await expect(
      extractCandidateDetails({
        model: mockOptimiseModel,
        submittedCVText: "Network Error",
      })
    ).rejects.toThrow("Network Error: Failed to fetch");

    expect(logger.error).toHaveBeenCalled();
  });

  it("should throw error with invalid input CV JSON", async () => {
    await expect(
      extractCandidateDetails({
        model: mockOptimiseModel,
        submittedCVText: "Invalid input",
      })
    ).rejects.toThrow("Invalid input CV JSON");

    expect(logger.error).toHaveBeenCalled();
  });
});
