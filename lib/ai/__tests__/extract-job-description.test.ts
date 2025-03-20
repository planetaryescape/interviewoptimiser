import { describe, expect, it, vi } from "vitest";
import { extractJobDescription } from "~/lib/ai/extract-job-description";

// Mock the db/schema imports
vi.mock("~/db/schema", () => {
  return {
    jobDescriptions: {
      id: {},
      optimizationId: {},
      company: {},
      role: {},
      requiredQualifications: {},
      requiredExperience: {},
      requiredSkills: {},
      preferredQualifications: {},
      preferredSkills: {},
      responsibilities: {},
      benefits: {},
      location: {},
      employmentType: {},
      seniority: {},
      industry: {},
      keyTechnologies: {},
      createdAt: {},
      updatedAt: {},
    },
  };
});

// Mock the createInsertSchema function
vi.mock("drizzle-zod", () => {
  return {
    createInsertSchema: () => ({
      extend: () => ({
        omit: () => ({
          parse: (data: unknown) => data,
        }),
      }),
    }),
  };
});

// Mock the generateObject function
vi.mock("ai", () => {
  return {
    generateObject: vi.fn().mockResolvedValue({
      object: {
        company: "Tech Company",
        role: "Software Engineer",
        requiredQualifications: ["Bachelor's degree in Computer Science or related field"],
        requiredExperience: ["3+ years of experience in software development"],
        requiredSkills: ["JavaScript", "TypeScript", "React"],
        preferredQualifications: ["Master's degree in Computer Science"],
        preferredSkills: ["Node.js", "AWS"],
        responsibilities: ["Develop and maintain web applications"],
        benefits: ["Competitive salary", "Health insurance"],
        location: "San Francisco, CA",
        employmentType: "Full-time",
        seniority: "Mid-level",
        industry: "Technology",
        keyTechnologies: ["React", "TypeScript", "Node.js"],
      },
      usage: {
        promptTokens: 100,
        completionTokens: 200,
      },
    }),
  };
});

// Mock the logger
vi.mock("~/lib/logger", () => {
  return {
    logger: {
      info: vi.fn(),
      error: vi.fn(),
    },
  };
});

// Mock Sentry
vi.mock("@sentry/serverless", () => {
  return {
    withScope: vi.fn((callback) => {
      callback({
        setExtra: vi.fn(),
      });
      return null;
    }),
    captureException: vi.fn(),
  };
});

describe("extractJobDescription", () => {
  it("should extract structured data from the job description", async () => {
    const mockModel = {} as any;
    const mockJobDescriptionText = "Software Engineer at Tech Company";

    const result = await extractJobDescription({
      model: mockModel,
      jobDescriptionText: mockJobDescriptionText,
      userEmail: "test@example.com",
    });

    expect(result).toEqual({
      data: {
        company: "Tech Company",
        role: "Software Engineer",
        requiredQualifications: ["Bachelor's degree in Computer Science or related field"],
        requiredExperience: ["3+ years of experience in software development"],
        requiredSkills: ["JavaScript", "TypeScript", "React"],
        preferredQualifications: ["Master's degree in Computer Science"],
        preferredSkills: ["Node.js", "AWS"],
        responsibilities: ["Develop and maintain web applications"],
        benefits: ["Competitive salary", "Health insurance"],
        location: "San Francisco, CA",
        employmentType: "Full-time",
        seniority: "Mid-level",
        industry: "Technology",
        keyTechnologies: ["React", "TypeScript", "Node.js"],
      },
      usage: {
        prompt_tokens: 100,
        completion_tokens: 200,
        total_tokens: 300,
      },
    });
  });
});
