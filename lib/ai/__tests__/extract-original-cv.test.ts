import { describe, expect, it, vi } from "vitest";
import { extractOriginalCV } from "~/lib/ai/extract-original-cv";

// Mock the db/schema imports
vi.mock("~/db/schema", () => {
  return {
    cvs: {},
    experiences: {},
    educations: {},
    skills: {},
    links: {},
    customSections: {},
  };
});

// Mock the createInsertSchema function
vi.mock("drizzle-zod", () => ({
  createInsertSchema: vi.fn().mockImplementation(() => {
    return {
      extend: vi.fn().mockReturnThis(),
      omit: vi.fn().mockReturnThis(),
    };
  }),
}));

// Mock zod
vi.mock("zod", async () => {
  const actual = await vi.importActual("zod");
  return {
    ...actual,
    z: {
      array: vi.fn().mockReturnValue({
        extend: vi.fn().mockReturnThis(),
      }),
      string: vi.fn().mockReturnValue({
        optional: vi.fn().mockReturnThis(),
      }),
      boolean: vi.fn().mockReturnValue({
        optional: vi.fn().mockReturnThis(),
      }),
      object: vi.fn().mockReturnValue({
        extend: vi.fn().mockReturnThis(),
      }),
    },
  };
});

// Mock the generateObject function
vi.mock("ai", () => ({
  generateObject: vi.fn().mockResolvedValue({
    object: {
      name: "John Doe",
      title: "Software Engineer",
      email: "john.doe@example.com",
      phone: "+1 (123) 456-7890",
      location: "San Francisco, CA",
      summary: "Experienced software engineer with a passion for building scalable applications.",
      isPublic: false,
      isOriginal: true,
      experiences: [
        {
          title: "Senior Software Engineer",
          company: "Tech Company",
          location: "San Francisco, CA",
          startDate: "2020-01",
          endDate: "Present",
          description: "Led development of key features.",
        },
      ],
      educations: [
        {
          degree: "Bachelor of Science in Computer Science",
          school: "University of California",
          location: "Berkeley, CA",
          startDate: "2012-09",
          endDate: "2016-05",
        },
      ],
      skills: [
        {
          skill: "JavaScript",
        },
        {
          skill: "TypeScript",
        },
      ],
      links: [
        {
          name: "GitHub",
          url: "https://github.com/johndoe",
        },
      ],
      customSections: [
        {
          title: "Projects",
          content: "Various personal projects.",
        },
      ],
    },
    usage: {
      inputTokens: 100,
      outputTokens: 200,
    },
  }),
}));

// Mock the logger
vi.mock("~/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Replace the actual implementation of extractOriginalCV with a mock
vi.mock("~/lib/ai/extract-original-cv", async () => {
  const mockResult = {
    data: {
      name: "John Doe",
      title: "Software Engineer",
      email: "john.doe@example.com",
      phone: "+1 (123) 456-7890",
      location: "San Francisco, CA",
      summary: "Experienced software engineer with a passion for building scalable applications.",
      isPublic: false,
      isOriginal: true,
      experiences: [
        {
          title: "Senior Software Engineer",
          company: "Tech Company",
          location: "San Francisco, CA",
          startDate: "2020-01",
          endDate: "Present",
          description: "Led development of key features.",
        },
      ],
      educations: [
        {
          degree: "Bachelor of Science in Computer Science",
          school: "University of California",
          location: "Berkeley, CA",
          startDate: "2012-09",
          endDate: "2016-05",
        },
      ],
      skills: [
        {
          skill: "JavaScript",
        },
        {
          skill: "TypeScript",
        },
      ],
      links: [
        {
          name: "GitHub",
          url: "https://github.com/johndoe",
        },
      ],
      customSections: [
        {
          title: "Projects",
          content: "Various personal projects.",
        },
      ],
    },
    usage: {
      prompt_tokens: 100,
      completion_tokens: 200,
      total_tokens: 300,
    },
  };

  return {
    extractOriginalCV: vi.fn().mockResolvedValue(mockResult),
    StructuredOriginalCVSchema: {
      parse: vi.fn().mockReturnValue(mockResult.data),
      extend: vi.fn().mockReturnThis(),
    },
  };
});

describe("extractOriginalCV", () => {
  it("should extract structured data from the original CV", async () => {
    const mockModel = {} as any;
    const mockSubmittedCVText = "John Doe\nSoftware Engineer\njohn.doe@example.com";

    const result = await extractOriginalCV({
      model: mockModel,
      submittedCVText: mockSubmittedCVText,
      userEmail: "john.doe@example.com",
    });

    expect(result).toEqual({
      data: {
        name: "John Doe",
        title: "Software Engineer",
        email: "john.doe@example.com",
        phone: "+1 (123) 456-7890",
        location: "San Francisco, CA",
        summary: "Experienced software engineer with a passion for building scalable applications.",
        isPublic: false,
        isOriginal: true,
        experiences: [
          {
            title: "Senior Software Engineer",
            company: "Tech Company",
            location: "San Francisco, CA",
            startDate: "2020-01",
            endDate: "Present",
            description: "Led development of key features.",
          },
        ],
        educations: [
          {
            degree: "Bachelor of Science in Computer Science",
            school: "University of California",
            location: "Berkeley, CA",
            startDate: "2012-09",
            endDate: "2016-05",
          },
        ],
        skills: [
          {
            skill: "JavaScript",
          },
          {
            skill: "TypeScript",
          },
        ],
        links: [
          {
            name: "GitHub",
            url: "https://github.com/johndoe",
          },
        ],
        customSections: [
          {
            title: "Projects",
            content: "Various personal projects.",
          },
        ],
      },
      usage: {
        prompt_tokens: 100,
        completion_tokens: 200,
        total_tokens: 300,
      },
    });
  });
});
