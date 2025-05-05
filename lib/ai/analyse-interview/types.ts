import type { LanguageModelV1 } from "@ai-sdk/provider";
import type { CompletionUsage } from "openai/resources/completions.mjs";
import type { z } from "zod";
import type { Interview as InterviewSchema } from "~/db/schema/interviews";
import type { CandidateDetails } from "~/lib/ai/extract-candidate-details";
import type { StructuredJobDescriptionSchema } from "~/lib/ai/extract-job-description";
import type { StructuredOriginalCVSchema } from "~/lib/ai/extract-original-cv";

/**
 * Base parameters used for all analyze functions
 */
export interface BaseAnalyzeParams {
  /**
   * The language model to use for analysis
   */
  model: LanguageModelV1;
  /**
   * The parsed interview transcript
   */
  transcript: any[];
  /**
   * Optional user email for tracking purposes
   */
  userEmail?: string;
  /**
   * Optional structured CV data extracted from the submitted CV
   */
  structuredCV?: z.infer<typeof StructuredOriginalCVSchema>;
  /**
   * Optional structured job description data
   */
  structuredJobDescription?: z.infer<typeof StructuredJobDescriptionSchema>;
  /**
   * Optional structured candidate details
   */
  structuredCandidateDetails?: CandidateDetails;
  /**
   * The original CV text
   */
  cvText?: string;
  /**
   * The job description text
   */
  jobDescriptionText?: string;
  /**
   * Additional information provided for the interview
   */
  additionalInfo?: string;
}

/**
 * Interface for analysing interview parameters
 */
export interface AnalyseInterviewParams {
  /**
   * The language model to use for analysis
   */
  model: LanguageModelV1;
  /**
   * The interview object containing basic information
   */
  interview: InterviewSchema;
  /**
   * The transcript of the interview in JSON string format
   */
  transcriptString: string;
  /**
   * Optional user email for tracking purposes
   */
  userEmail?: string;
  /**
   * Optional structured CV data extracted from the submitted CV
   */
  structuredCV?: z.infer<typeof StructuredOriginalCVSchema>;
  /**
   * Optional structured job description data
   */
  structuredJobDescription?: z.infer<typeof StructuredJobDescriptionSchema>;
  /**
   * Optional structured candidate details
   */
  structuredCandidateDetails?: CandidateDetails;
}

/**
 * Common response structure for individual analysis sections
 */
export interface AnalysisSectionResult<T> {
  data: T;
  usage: CompletionUsage;
}

/**
 * Structure for question analysis
 */
export interface QuestionAnalysisData {
  question: string;
  analysis: string;
  score: number;
  isKeyQuestion: boolean;
}

/**
 * Common utility for combining token usage from multiple AI calls
 */
export function combineUsage(usages: CompletionUsage[]): CompletionUsage {
  return usages.reduce(
    (acc, usage) => ({
      prompt_tokens: acc.prompt_tokens + (usage.prompt_tokens || 0),
      completion_tokens: acc.completion_tokens + (usage.completion_tokens || 0),
      total_tokens: acc.total_tokens + (usage.total_tokens || 0),
    }),
    { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
  );
}
