import * as Sentry from "@sentry/nextjs";
import { generateObject } from "ai";
import { logger } from "~/lib/logger";
import { GENERAL_ASSESSMENT_SYSTEM_PROMPT, GENERAL_ASSESSMENT_USER_PROMPT } from "../prompts";
import { type GeneralAssessmentAnalysis, GeneralAssessmentSchema } from "../schemas";
import type { AnalysisSectionResult, BaseAnalyzeParams } from "../types";
import { createRequestHeaders, formatStructuredData } from "../utils";

/**
 * Interface for general assessment parameters
 */
interface GeneralAssessmentParams extends BaseAnalyzeParams {
  /**
   * Results from all section analyses to synthesize
   */
  sectionResults: Record<string, any>;
}

/**
 * Analyzes all section results and creates a comprehensive general assessment
 * @param params - Parameters including results from all analysis sections
 * @returns General assessment with usage information
 */
export async function analyzeGeneralAssessment({
  model,
  transcript,
  userEmail,
  structuredCV,
  structuredJobDescription,
  structuredCandidateDetails,
  cvText,
  jobDescriptionText,
  additionalInfo,
  sectionResults,
}: GeneralAssessmentParams): Promise<AnalysisSectionResult<GeneralAssessmentAnalysis>> {
  logger.info("Synthesizing general assessment from section analyses");

  try {
    // Format structured data for prompt
    const structuredDataText = formatStructuredData(
      structuredCV,
      structuredJobDescription,
      structuredCandidateDetails
    );

    // Format section results for inclusion in the prompt
    const formattedSectionResults = Object.entries(sectionResults)
      .map(([section, result]) => {
        return `
## ${section.toUpperCase()}

${Object.entries(result)
  .map(([key, value]) => {
    if (Array.isArray(value)) {
      return `
### ${key}
${value.map((item: string) => `- ${item}`).join("\n")}
`;
    } else if (typeof value === "number") {
      return `
### ${key}
Score: ${value}/100
`;
    } else if (typeof value === "string") {
      return `
### ${key}
${value}
`;
    }
    return "";
  })
  .join("\n")}
`;
      })
      .join("\n\n");

    // Replace placeholders in the user prompt
    const enhancedUserPrompt = GENERAL_ASSESSMENT_USER_PROMPT.replace(
      "{{SECTION_RESULTS}}",
      formattedSectionResults
    )
      .replace("{{STRUCTURED_DATA}}", structuredDataText)
      .replace("{{TRANSCRIPT}}", JSON.stringify(transcript))
      .replace("{{CV}}", cvText || "Not provided")
      .replace("{{JD}}", jobDescriptionText || "Not provided")
      .replace("{{ADDITIONAL_INFO}}", additionalInfo || "None");

    // Generate the structured output
    const { object: structuredOutput, usage } = await generateObject({
      model,
      schema: GeneralAssessmentSchema,
      schemaName: "generalAssessmentAnalysis",
      schemaDescription: "Comprehensive synthesis of all interview analysis sections",
      system: GENERAL_ASSESSMENT_SYSTEM_PROMPT,
      prompt: enhancedUserPrompt,
      temperature: 0.5,
      headers: createRequestHeaders(userEmail),
    });

    return {
      data: structuredOutput,
      usage: {
        prompt_tokens: usage.promptTokens,
        completion_tokens: usage.completionTokens,
        total_tokens: usage.promptTokens + usage.completionTokens,
      },
    };
  } catch (error) {
    // Log the error and rethrow it
    Sentry.withScope((scope) => {
      scope.setExtra("context", "analyzeGeneralAssessment");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error synthesizing general assessment"
    );
    throw error;
  }
}
