import type { LanguageModel } from "ai";
import { generateObject, generateText } from "ai";
import type { z } from "zod";
import { getModelForOperation } from "~/lib/ai/models";
import { logger } from "~/lib/logger";

/**
 * Performs a two-step AI process where Gemini generates initial text and o4-mini structures it.
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
  initialModel: LanguageModel;
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

    // Step 2: Structure the output with o4-mini
    const o3Mini = getModelForOperation("analyse_interview", userEmail);
    const { object: structuredOutput, usage: o3MiniUsage } = await generateObject({
      model: o3Mini,
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
          prompt_tokens: (initialUsage.inputTokens ?? 0) + (o3MiniUsage.inputTokens ?? 0),
          completion_tokens: (initialUsage.outputTokens ?? 0) + (o3MiniUsage.outputTokens ?? 0),
          total_tokens:
            (initialUsage.inputTokens ?? 0) +
            (initialUsage.outputTokens ?? 0) +
            (o3MiniUsage.inputTokens ?? 0) +
            (o3MiniUsage.outputTokens ?? 0),
        },
      };
    }

    return {
      data: parsedOutput,
      error: null,
      usage: {
        prompt_tokens: (initialUsage.inputTokens ?? 0) + (o3MiniUsage.inputTokens ?? 0),
        completion_tokens: (initialUsage.outputTokens ?? 0) + (o3MiniUsage.outputTokens ?? 0),
        total_tokens:
          (initialUsage.inputTokens ?? 0) +
          (initialUsage.outputTokens ?? 0) +
          (o3MiniUsage.inputTokens ?? 0) +
          (o3MiniUsage.outputTokens ?? 0),
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
 * Performs a single-step AI process using o4-mini to generate structured output directly.
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
  model: LanguageModel;
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
          prompt_tokens: usage.inputTokens ?? 0,
          completion_tokens: usage.outputTokens ?? 0,
          total_tokens: (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
        },
      };
    }

    return {
      data: parsedOutput,
      error: null,
      usage: {
        prompt_tokens: usage.inputTokens ?? 0,
        completion_tokens: usage.outputTokens ?? 0,
        total_tokens: (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
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
