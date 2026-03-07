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

    // Add section-specific instructions
    const sectionPrompt = `${enhancedUserPrompt}

SPECIFIC GUIDANCE FOR GENERAL ASSESSMENT SYNTHESIS:

1. CREATE A BALANCED SUMMARY:
   - Synthesize findings from all section analyses while maintaining a balanced view
   - Identify patterns across different assessment dimensions
   - Highlight both consistent strengths and recurring weaknesses

2. ADDRESS ROLE ALIGNMENT:
   - Based on all sections, assess overall alignment with the specific role requirements
   - Consider the relative importance of different aspects based on the role type
   - Address both technical and interpersonal dimensions of fit

3. PROVIDE HIRING GUIDANCE:
   - Make a clear hiring recommendation (hire, do not hire, or consider with reservations)
   - Justify your recommendation with specific evidence from across the assessment
   - Note any special considerations that might affect the hiring decision

4. PRIORITIZE DEVELOPMENT AREAS:
   - Identify the 3-5 most critical areas for improvement based on all sections
   - Prioritize these based on relevance to role success
   - Acknowledge strengths that could be leveraged for development

5. CALCULATE OVERALL SCORE:
   - Use a weighted approach based on role requirements, not simple averaging
   - Explain your weighting rationale clearly
   - Ensure the overall score reflects performance across all dimensions appropriately

IMPORTANT REMINDER ABOUT COVERAGE:
- In your synthesis, be explicit about any areas that were not adequately covered in the interview
- Do not assume competence or weakness in areas that weren't discussed
- If making inferences about areas not directly assessed, clearly explain your reasoning and cite specific evidence
- Weight your overall assessment and score toward areas that were adequately demonstrated
- Acknowledge limitations in your assessment due to areas not covered

FORMAT REQUIREMENTS:
- Format your entire response in proper Markdown
- Use headings (## and ###) for clear organization
- Use bullet points (*) for listing items
- Use bold (**text**) and italic (*text*) for emphasis
- Include direct quotes from the transcript in blockquotes (> quote)

Remember: This general assessment will serve as the executive summary of the entire interview analysis. Make it comprehensive, cohesive, and evidence-based, always maintaining the principles of Radical Candor.
`;

    // Generate the structured output
    const { object: structuredOutput, usage } = await generateObject({
      model,
      schema: GeneralAssessmentSchema,
      schemaName: "generalAssessmentAnalysis",
      schemaDescription: "Comprehensive synthesis of all interview analysis sections",
      system: GENERAL_ASSESSMENT_SYSTEM_PROMPT,
      prompt: sectionPrompt,
      temperature: 1,
      headers: createRequestHeaders(userEmail),
    });

    return {
      data: structuredOutput,
      usage: {
        prompt_tokens: usage.inputTokens ?? 0,
        completion_tokens: usage.outputTokens ?? 0,
        total_tokens: (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
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
