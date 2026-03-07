/**
 * Model Providers - SDK instance creation
 *
 * Handles creating provider SDK instances and model instances.
 */

import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";
import { MODEL_REGISTRY, type ModelProvider } from "./config";

export function getProviderInstance(
  provider: ModelProvider,
  userEmail?: string
): ReturnType<typeof createOpenAI> | ReturnType<typeof createOpenRouter> {
  const defaultHeaders = {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
    "Helicone-Cache-Enabled": "true",
    "Helicone-Posthog-Key": process.env.POSTHOG_KEY ?? "",
    "Helicone-Posthog-Host": "https://eu.posthog.com",
  };

  const headers = userEmail ? { ...defaultHeaders, "Helicone-User-Id": userEmail } : defaultHeaders;

  const customFetch = (url: string | URL | Request, init?: RequestInit) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 170000);
    return fetch(url, { ...init, signal: controller.signal }).finally(() =>
      clearTimeout(timeoutId)
    );
  };

  switch (provider) {
    case "openai":
      return createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: "https://oai.helicone.ai/v1",
        headers,
        fetch: customFetch,
      });

    case "openrouter":
      return createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
        headers,
        fetch: customFetch,
      });

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export function createModelInstance(modelName: string, userEmail?: string): LanguageModel {
  const entry = MODEL_REGISTRY[modelName];
  if (!entry) {
    throw new Error(`Model not found in registry: ${modelName}`);
  }

  const provider = getProviderInstance(entry.provider, userEmail);

  switch (entry.provider) {
    case "openai": {
      const openaiProvider = provider as ReturnType<typeof createOpenAI>;
      return openaiProvider(entry.modelId);
    }
    case "openrouter": {
      const openrouterProvider = provider as ReturnType<typeof createOpenRouter>;
      return openrouterProvider(entry.modelId) as unknown as LanguageModel;
    }
    default:
      throw new Error(`Unsupported provider: ${entry.provider}`);
  }
}
