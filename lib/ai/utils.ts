import type { LanguageModelV1 } from "@ai-sdk/provider";
import { generateObject, generateText } from "ai";
import type { z } from "zod";
import { logger } from "~/lib/logger";
import { getOpenAiClient } from "~/lib/openai";

/**
 * Performs a two-step AI process where Gemini generates initial text and GPT-4o-mini structures it.
 * @param params Parameters for the two-step AI process
 * @returns The structured output and combined usage statistics
 */
export async function twoStepAIProcess<T>({
  initialModel,
  systemPrompt,
  userPrompt,
  schema,
  schemaName,
  schemaDescription,
  userEmail,
}: {
  initialModel: LanguageModelV1;
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T>;
  schemaName: string;
  schemaDescription: string;
  userEmail?: string;
}): Promise<{
  data: T | null;
  error: unknown | null;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}> {
  try {
    // Step 1: Generate initial text with Gemini
    const { text: initialText, usage: initialUsage } = await generateText({
      model: initialModel,
      system: systemPrompt,
      prompt: userPrompt,
      headers: {
        "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
        ...(userEmail && { "Helicone-User-Id": userEmail }),
      },
    });

    // Step 2: Structure the output with GPT-4o
    const gpt4o = getOpenAiClient(userEmail)("gpt-4o");
    const { object: structuredOutput, usage: gpt4Usage } = await generateObject({
      model: gpt4o,
      schema,
      schemaName,
      schemaDescription,
      system:
        "You are a structured data generator. Your task is to take the provided text and convert it into a structured format according to the schema.",
      prompt: `Please convert the following text into a structured format:\n\n${initialText}`,
      headers: {
        "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
        ...(userEmail && { "Helicone-User-Id": userEmail }),
      },
    });

    const safeParseResult = schema.safeParse(structuredOutput);
    const parsedOutput = safeParseResult.success ? safeParseResult.data : null;

    if (!parsedOutput) {
      logger.error(
        {
          errors: safeParseResult.success ? undefined : safeParseResult.error,
        },
        "Failed to parse structured output:"
      );
      return {
        data: null,
        error: safeParseResult.success ? undefined : safeParseResult.error,
        usage: {
          prompt_tokens: initialUsage.promptTokens + gpt4Usage.promptTokens,
          completion_tokens: initialUsage.completionTokens + gpt4Usage.completionTokens,
          total_tokens:
            initialUsage.promptTokens +
            initialUsage.completionTokens +
            gpt4Usage.promptTokens +
            gpt4Usage.completionTokens,
        },
      };
    }

    return {
      data: parsedOutput,
      error: null,
      usage: {
        prompt_tokens: initialUsage.promptTokens + gpt4Usage.promptTokens,
        completion_tokens: initialUsage.completionTokens + gpt4Usage.completionTokens,
        total_tokens:
          initialUsage.promptTokens +
          initialUsage.completionTokens +
          gpt4Usage.promptTokens +
          gpt4Usage.completionTokens,
      },
    };
  } catch (error) {
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error in two-step AI process"
    );
    return {
      data: null,
      error,
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    };
  }
}

/**
 * Performs a single-step AI process using GPT-4o to generate structured output directly.
 * @param params Parameters for the single-step AI process
 * @returns The structured output and usage statistics
 */
export async function singleStepAIProcess<T>({
  model,
  systemPrompt,
  userPrompt,
  schema,
  schemaName,
  schemaDescription,
  userEmail,
}: {
  model: LanguageModelV1;
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T>;
  schemaName: string;
  schemaDescription: string;
  userEmail?: string;
}): Promise<{
  data: T | null;
  error: unknown | null;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}> {
  try {
    // Generate structured output directly with the provided model
    const { object: structuredOutput, usage } = await generateObject({
      model,
      schema,
      schemaName,
      schemaDescription,
      system: systemPrompt,
      prompt: userPrompt,
      headers: {
        "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
        ...(userEmail && { "Helicone-User-Id": userEmail }),
      },
    });

    const safeParseResult = schema.safeParse(structuredOutput);
    const parsedOutput = safeParseResult.success ? safeParseResult.data : null;

    if (!parsedOutput) {
      logger.error(
        {
          errors: safeParseResult.success ? undefined : safeParseResult.error,
        },
        "Failed to parse structured output:"
      );
      return {
        data: null,
        error: safeParseResult.success ? undefined : safeParseResult.error,
        usage: {
          prompt_tokens: usage.promptTokens,
          completion_tokens: usage.completionTokens,
          total_tokens: usage.promptTokens + usage.completionTokens,
        },
      };
    }

    return {
      data: parsedOutput,
      error: null,
      usage: {
        prompt_tokens: usage.promptTokens,
        completion_tokens: usage.completionTokens,
        total_tokens: usage.promptTokens + usage.completionTokens,
      },
    };
  } catch (error) {
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error in single-step AI process"
    );
    return {
      data: null,
      error,
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    };
  }
}
