import type { LanguageModel } from "ai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { logger } from "~/lib/logger";
import { twoStepAIProcess } from "../utils";
import { mockUsage } from "./test-utils";

// Mock the logger
vi.mock("~/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock openai
vi.mock("@ai-sdk/openai", async () => {
  const actual = await vi.importActual("@ai-sdk/openai");
  return {
    ...actual,
    openai: vi.fn(),
  };
});

// Mock generateText and generateObject
vi.mock("ai", () => ({
  generateText: vi.fn(),
  generateObject: vi.fn(),
}));

// AI SDK v6 mock helpers — use `as any` since we mock at the module level
const mockModel = {
  specificationVersion: "v3",
  provider: "openai",
  modelId: "gpt-5-mini",
} as unknown as LanguageModel;

function mockUsageV6() {
  return {
    inputTokens: mockUsage.prompt_tokens,
    outputTokens: mockUsage.completion_tokens,
    totalTokens: mockUsage.total_tokens,
    inputTokenDetails: {
      noCacheTokens: undefined,
      cacheReadTokens: undefined,
      cacheWriteTokens: undefined,
    },
    outputTokenDetails: { reasoningTokens: undefined },
  };
}

function mockTextResult(overrides: Record<string, unknown> = {}) {
  return {
    text: "Generated text",
    reasoning: [],
    sources: [],
    files: [],
    experimental_output: null,
    toolCalls: [],
    reasoningDetails: [],
    finishReason: "stop",
    usage: mockUsageV6(),
    request: {},
    response: {
      id: "res_1",
      timestamp: new Date(),
      modelId: "gpt-5-mini",
      messages: [],
    },
    warnings: [],
    toolResults: [],
    steps: [],
    logprobs: undefined,
    providerMetadata: {},
    experimental_providerMetadata: {},
    ...overrides,
  } as any;
}

function mockObjectResult(object: unknown, overrides: Record<string, unknown> = {}) {
  return {
    object,
    finishReason: "stop",
    warnings: [],
    request: {},
    response: {
      id: "res_2",
      timestamp: new Date(),
      modelId: "gpt-5-mini",
    },
    usage: mockUsageV6(),
    logprobs: undefined,
    providerMetadata: {},
    experimental_providerMetadata: {},
    toJsonResponse: () => new Response(JSON.stringify(object)),
    ...overrides,
  } as any;
}

describe("twoStepAIProcess", () => {
  const mockSchema = z.object({
    field: z.string(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully process text in two steps", async () => {
    const { generateText, generateObject } = await import("ai");
    const { openai } = await import("@ai-sdk/openai");

    vi.mocked(generateText).mockResolvedValue(mockTextResult());
    vi.mocked(openai).mockReturnValue(mockModel as any);
    vi.mocked(generateObject).mockResolvedValue(mockObjectResult({ field: "Structured output" }));

    const result = await twoStepAIProcess({
      initialModel: mockModel,
      systemPrompt: "System prompt",
      userPrompt: "User prompt",
      schema: mockSchema,
      schemaName: "testSchema",
      schemaDescription: "Test schema description",
    });

    expect(result.data).toEqual({ field: "Structured output" });
    expect(result.error).toBeNull();
    expect(result.usage).toEqual({
      prompt_tokens: mockUsage.prompt_tokens * 2,
      completion_tokens: mockUsage.completion_tokens * 2,
      total_tokens: (mockUsage.prompt_tokens + mockUsage.completion_tokens) * 2,
    });
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("should handle initial text generation errors", async () => {
    const { generateText } = await import("ai");

    vi.mocked(generateText).mockRejectedValue(new Error("Text generation failed"));

    const result = await twoStepAIProcess({
      initialModel: mockModel,
      systemPrompt: "System prompt",
      userPrompt: "User prompt",
      schema: mockSchema,
      schemaName: "testSchema",
      schemaDescription: "Test schema description",
    });

    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error).toHaveProperty("message", "Text generation failed");
    expect(result.usage).toEqual({
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    });
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Text generation failed",
        error: expect.any(Error),
      }),
      "Error in two-step AI process"
    );
  });

  it("should handle structured output generation errors", async () => {
    const { generateText, generateObject } = await import("ai");
    const { openai } = await import("@ai-sdk/openai");

    vi.mocked(generateText).mockResolvedValue(mockTextResult());
    vi.mocked(openai).mockReturnValue(mockModel as any);
    vi.mocked(generateObject).mockRejectedValue(new Error("Structured output generation failed"));

    const result = await twoStepAIProcess({
      initialModel: mockModel,
      systemPrompt: "System prompt",
      userPrompt: "User prompt",
      schema: mockSchema,
      schemaName: "testSchema",
      schemaDescription: "Test schema description",
    });

    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error).toHaveProperty("message", "Structured output generation failed");
    expect(result.usage).toEqual({
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    });
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Structured output generation failed",
        error: expect.any(Error),
      }),
      "Error in two-step AI process"
    );
  });

  it("should handle schema validation errors", async () => {
    const { generateText, generateObject } = await import("ai");
    const { openai } = await import("@ai-sdk/openai");

    vi.mocked(generateText).mockResolvedValue(mockTextResult());
    vi.mocked(openai).mockReturnValue(mockModel as any);
    vi.mocked(generateObject).mockResolvedValue(mockObjectResult({ wrongField: "Invalid output" }));

    const result = await twoStepAIProcess({
      initialModel: mockModel,
      systemPrompt: "System prompt",
      userPrompt: "User prompt",
      schema: mockSchema,
      schemaName: "testSchema",
      schemaDescription: "Test schema description",
    });

    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.usage).toEqual({
      prompt_tokens: mockUsage.prompt_tokens * 2,
      completion_tokens: mockUsage.completion_tokens * 2,
      total_tokens: (mockUsage.prompt_tokens + mockUsage.completion_tokens) * 2,
    });
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.any(Object),
      }),
      "Failed to parse structured output:"
    );
  });

  it("should include user email in headers when provided", async () => {
    const { generateText, generateObject } = await import("ai");
    const { openai } = await import("@ai-sdk/openai");

    vi.mocked(generateText).mockResolvedValue(mockTextResult());
    vi.mocked(openai).mockReturnValue(mockModel as any);
    vi.mocked(generateObject).mockResolvedValue(mockObjectResult({ field: "Structured output" }));

    await twoStepAIProcess({
      initialModel: mockModel,
      systemPrompt: "System prompt",
      userPrompt: "User prompt",
      schema: mockSchema,
      schemaName: "testSchema",
      schemaDescription: "Test schema description",
      userEmail: "test@example.com",
    });

    expect(generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          "Helicone-User-Id": "test@example.com",
        }),
      })
    );

    expect(generateObject).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          "Helicone-User-Id": "test@example.com",
        }),
      })
    );
  });
});
