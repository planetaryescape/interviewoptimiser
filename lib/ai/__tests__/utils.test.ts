import type { LanguageModelV1, LanguageModelV1FinishReason } from "@ai-sdk/provider";
import type { GenerateObjectResult, GenerateTextResult, JSONValue } from "ai";
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

describe("twoStepAIProcess", () => {
  const mockSchema = z.object({
    field: z.string(),
  });

  const mockInitialModel: LanguageModelV1 = {
    specificationVersion: "v1" as const,
    provider: "openai" as const,
    modelId: "o4-mini",
    defaultObjectGenerationMode: "json" as const,
    doGenerate: async () => ({
      text: "",
      finishReason: "stop" as LanguageModelV1FinishReason,
      usage: {
        promptTokens: mockUsage.prompt_tokens,
        completionTokens: mockUsage.completion_tokens,
        totalTokens: mockUsage.total_tokens,
      },
      rawCall: { rawPrompt: null, rawSettings: {} },
    }),
    doStream: async () => {
      throw new Error("Not implemented");
    },
  };

  const mockGpt4oMini: LanguageModelV1 = {
    specificationVersion: "v1" as const,
    provider: "openai" as const,
    modelId: "o4-mini",
    defaultObjectGenerationMode: "json" as const,
    doGenerate: async () => ({
      text: "",
      finishReason: "stop" as LanguageModelV1FinishReason,
      usage: {
        promptTokens: mockUsage.prompt_tokens,
        completionTokens: mockUsage.completion_tokens,
        totalTokens: mockUsage.total_tokens,
      },
      rawCall: { rawPrompt: null, rawSettings: {} },
    }),
    doStream: async () => {
      throw new Error("Not implemented");
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully process text in two steps", async () => {
    const { generateText, generateObject } = await import("ai");
    const { openai } = await import("@ai-sdk/openai");

    const mockTextResult: GenerateTextResult<Record<string, never>, JSONValue> = {
      text: "Generated text",
      reasoning: "",
      sources: [],
      files: [],
      experimental_output: null,
      toolCalls: [],
      reasoningDetails: [],
      finishReason: "stop" as LanguageModelV1FinishReason,
      usage: {
        promptTokens: mockUsage.prompt_tokens,
        completionTokens: mockUsage.completion_tokens,
        totalTokens: mockUsage.total_tokens,
      },
      request: {},
      response: {
        id: "res_1",
        timestamp: new Date(),
        modelId: "o4-mini",
        messages: [],
      },
      warnings: [],
      toolResults: [],
      steps: [],
      logprobs: undefined,
      providerMetadata: {},
      experimental_providerMetadata: {},
    };

    const mockObjectResult: GenerateObjectResult<JSONValue> = {
      object: { field: "Structured output" },
      finishReason: "stop" as LanguageModelV1FinishReason,
      warnings: [],
      request: {},
      response: {
        id: "res_2",
        timestamp: new Date(),
        modelId: "o4-mini",
      },
      usage: {
        promptTokens: mockUsage.prompt_tokens,
        completionTokens: mockUsage.completion_tokens,
        totalTokens: mockUsage.total_tokens,
      },
      logprobs: undefined,
      providerMetadata: {},
      experimental_providerMetadata: {},
      toJsonResponse: () => new Response(JSON.stringify({ field: "Structured output" })),
    };

    vi.mocked(generateText).mockResolvedValue(mockTextResult);
    vi.mocked(openai).mockReturnValue(mockGpt4oMini);
    vi.mocked(generateObject).mockResolvedValue(mockObjectResult);

    const result = await twoStepAIProcess({
      initialModel: mockInitialModel,
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
      initialModel: mockInitialModel,
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

    const mockTextResult: GenerateTextResult<Record<string, never>, JSONValue> = {
      text: "Generated text",
      reasoning: "",
      sources: [],
      files: [],
      experimental_output: null,
      toolCalls: [],
      reasoningDetails: [],
      finishReason: "stop" as LanguageModelV1FinishReason,
      usage: {
        promptTokens: mockUsage.prompt_tokens,
        completionTokens: mockUsage.completion_tokens,
        totalTokens: mockUsage.total_tokens,
      },
      request: {},
      response: {
        id: "res_3",
        timestamp: new Date(),
        modelId: "o4-mini",
        messages: [],
      },
      warnings: [],
      toolResults: [],
      steps: [],
      logprobs: undefined,
      providerMetadata: {},
      experimental_providerMetadata: {},
    };

    vi.mocked(generateText).mockResolvedValue(mockTextResult);
    vi.mocked(openai).mockReturnValue(mockGpt4oMini);
    vi.mocked(generateObject).mockRejectedValue(new Error("Structured output generation failed"));

    const result = await twoStepAIProcess({
      initialModel: mockInitialModel,
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

    const mockTextResult: GenerateTextResult<Record<string, never>, JSONValue> = {
      text: "Generated text",
      reasoning: "",
      sources: [],
      files: [],
      experimental_output: null,
      toolCalls: [],
      reasoningDetails: [],
      finishReason: "stop" as LanguageModelV1FinishReason,
      usage: {
        promptTokens: mockUsage.prompt_tokens,
        completionTokens: mockUsage.completion_tokens,
        totalTokens: mockUsage.total_tokens,
      },
      request: {},
      response: {
        id: "res_4",
        timestamp: new Date(),
        modelId: "o4-mini",
        messages: [],
      },
      warnings: [],
      toolResults: [],
      steps: [],
      logprobs: undefined,
      providerMetadata: {},
      experimental_providerMetadata: {},
    };

    const mockInvalidObjectResult: GenerateObjectResult<JSONValue> = {
      object: { wrongField: "Invalid output" },
      finishReason: "stop" as LanguageModelV1FinishReason,
      warnings: [],
      request: {},
      response: {
        id: "res_5",
        timestamp: new Date(),
        modelId: "o4-mini",
      },
      usage: {
        promptTokens: mockUsage.prompt_tokens,
        completionTokens: mockUsage.completion_tokens,
        totalTokens: mockUsage.total_tokens,
      },
      logprobs: undefined,
      providerMetadata: {},
      experimental_providerMetadata: {},
      toJsonResponse: () => new Response(JSON.stringify({ wrongField: "Invalid output" })),
    };

    vi.mocked(generateText).mockResolvedValue(mockTextResult);
    vi.mocked(openai).mockReturnValue(mockGpt4oMini);
    vi.mocked(generateObject).mockResolvedValue(mockInvalidObjectResult);

    const result = await twoStepAIProcess({
      initialModel: mockInitialModel,
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

    const mockTextResult: GenerateTextResult<Record<string, never>, JSONValue> = {
      text: "Generated text",
      reasoning: "",
      sources: [],
      files: [],
      experimental_output: null,
      toolCalls: [],
      reasoningDetails: [],
      finishReason: "stop" as LanguageModelV1FinishReason,
      usage: {
        promptTokens: mockUsage.prompt_tokens,
        completionTokens: mockUsage.completion_tokens,
        totalTokens: mockUsage.total_tokens,
      },
      request: {},
      response: {
        id: "res_6",
        timestamp: new Date(),
        modelId: "o4-mini",
        messages: [],
      },
      warnings: [],
      toolResults: [],
      steps: [],
      logprobs: undefined,
      providerMetadata: {},
      experimental_providerMetadata: {},
    };

    const mockObjectResult: GenerateObjectResult<JSONValue> = {
      object: { field: "Structured output" },
      finishReason: "stop" as LanguageModelV1FinishReason,
      warnings: [],
      request: {},
      response: {
        id: "res_7",
        timestamp: new Date(),
        modelId: "o4-mini",
      },
      usage: {
        promptTokens: mockUsage.prompt_tokens,
        completionTokens: mockUsage.completion_tokens,
        totalTokens: mockUsage.total_tokens,
      },
      logprobs: undefined,
      providerMetadata: {},
      experimental_providerMetadata: {},
      toJsonResponse: () => new Response(JSON.stringify({ field: "Structured output" })),
    };

    vi.mocked(generateText).mockResolvedValue(mockTextResult);
    vi.mocked(openai).mockReturnValue(mockGpt4oMini);
    vi.mocked(generateObject).mockResolvedValue(mockObjectResult);

    await twoStepAIProcess({
      initialModel: mockInitialModel,
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
