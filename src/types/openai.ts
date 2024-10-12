import { CompletionUsage } from "openai/resources/completions.mjs";

export interface OpenAIResponse {
  usage: CompletionUsage;
  // Add other properties as needed
}
