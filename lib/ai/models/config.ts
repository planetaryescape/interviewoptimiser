/**
 * Model Configuration - Single Source of Truth
 *
 * Edit this file to change which models are used for which operations.
 */

export type ModelProvider = "openai" | "openrouter";

export interface ModelRegistryEntry {
  provider: ModelProvider;
  displayName: string;
  modelId: string;
}

export type AIOperation =
  | "extract_from_document"
  | "extract_candidate_details"
  | "extract_job_description"
  | "extract_questions"
  | "extract_original_cv"
  | "analyse_interview"
  | "vet_review"
  | "recruitment_questions";

// =============================================================================
// AVAILABLE MODELS
// =============================================================================

export const MODEL_REGISTRY: Record<string, ModelRegistryEntry> = {
  // OpenAI
  "gpt-5": { provider: "openai", displayName: "GPT-5", modelId: "gpt-5" },
  "gpt-5-mini": { provider: "openai", displayName: "GPT-5 Mini", modelId: "gpt-5-mini" },
  "o4-mini": { provider: "openai", displayName: "O4 Mini", modelId: "o4-mini" },

  // OpenRouter
  "grok-4.1-fast": {
    provider: "openrouter",
    displayName: "Grok 4.1 Fast",
    modelId: "x-ai/grok-4.1-fast",
  },
  "grok-4-fast": {
    provider: "openrouter",
    displayName: "Grok 4 Fast",
    modelId: "x-ai/grok-4-fast",
  },
  "kimi-k2-thinking": {
    provider: "openrouter",
    displayName: "Kimi K2 Thinking",
    modelId: "moonshotai/kimi-k2-thinking",
  },
  "glm-4.7": { provider: "openrouter", displayName: "GLM 4.7", modelId: "zhipu-ai/glm-4.7" },
  "gemini-3-flash": {
    provider: "openrouter",
    displayName: "Gemini 3 Flash",
    modelId: "google/gemini-3-flash",
  },
};

// =============================================================================
// DEFAULT MODEL PER OPERATION
// =============================================================================

export const OPERATION_MODELS: Record<AIOperation, string> = {
  // Extraction — fast structured extraction via OpenRouter
  extract_from_document: "grok-4.1-fast",
  extract_candidate_details: "grok-4.1-fast",
  extract_job_description: "grok-4.1-fast",
  extract_questions: "grok-4.1-fast",
  extract_original_cv: "grok-4.1-fast",

  // Analysis — reasoning model
  analyse_interview: "gpt-5-mini",

  // Review — structured parsing
  vet_review: "gpt-5-mini",

  // Recruitment — general purpose
  recruitment_questions: "gpt-5-mini",
};

// =============================================================================
// FALLBACK MODELS — used when primary fails (rate limits, service issues)
// =============================================================================

export const FALLBACK_MODELS: Partial<Record<string, string>> = {
  "grok-4.1-fast": "glm-4.7",
  "grok-4-fast": "glm-4.7",
  "kimi-k2-thinking": "glm-4.7",
  "gpt-5": "glm-4.7",
  "gpt-5-mini": "glm-4.7",
  "o4-mini": "glm-4.7",
  "gemini-3-flash": "glm-4.7",
};
