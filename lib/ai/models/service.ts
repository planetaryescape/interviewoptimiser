/**
 * Model Service - Runtime model selection with fallback
 */

import type { LanguageModel } from "ai";
import { logger } from "~/lib/logger";
import { type AIOperation, FALLBACK_MODELS, MODEL_REGISTRY, OPERATION_MODELS } from "./config";
import { createModelInstance } from "./providers";

/**
 * Get the default model for a specific operation.
 */
export function getModelForOperation(operation: AIOperation, userEmail?: string): LanguageModel {
  const modelName = OPERATION_MODELS[operation];
  if (!modelName) {
    throw new Error(`No default model configured for: ${operation}`);
  }
  return createModelInstance(modelName, userEmail);
}

/**
 * Get model with automatic fallback if primary fails.
 */
export function getModelWithFallback(
  operation: AIOperation,
  userEmail?: string
): { model: LanguageModel; modelName: string; getFallback: () => LanguageModel | null } {
  const modelName = OPERATION_MODELS[operation] || "gpt-5-mini";
  const model = createModelInstance(modelName, userEmail);

  const getFallback = () => {
    const fallbackModelName = FALLBACK_MODELS[modelName];
    if (!fallbackModelName || !MODEL_REGISTRY[fallbackModelName]) {
      logger.warn({ operation, modelName }, "No fallback model configured");
      return null;
    }
    logger.warn(
      { operation, primaryModel: modelName, fallbackModel: fallbackModelName },
      "Using fallback model"
    );
    return createModelInstance(fallbackModelName, userEmail);
  };

  return { model, modelName, getFallback };
}
