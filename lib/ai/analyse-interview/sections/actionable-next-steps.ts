import * as Sentry from "@sentry/nextjs";
import { generateObject } from "ai";
import { logger } from "~/lib/logger";
import { BASE_SYSTEM_PROMPT, BASE_USER_PROMPT } from "../prompts";
import { type ActionableNextStepsAnalysis, ActionableNextStepsSchema } from "../schemas";
import type { AnalysisSectionResult, BaseAnalyzeParams } from "../types";
import { createRequestHeaders, formatStructuredData } from "../utils";

/**
 * Analyzes and generates actionable next steps for the candidate based on the interview transcript
 * @param params - Common parameters for analysis
 * @returns Analysis of actionable next steps with usage information
 */
export async function analyzeActionableNextSteps({
  model,
  transcript,
  userEmail,
  structuredCV,
  structuredJobDescription,
  structuredCandidateDetails,
  cvText,
  jobDescriptionText,
  additionalInfo,
}: BaseAnalyzeParams): Promise<AnalysisSectionResult<ActionableNextStepsAnalysis>> {
  logger.info("Analyzing and generating actionable next steps for the candidate");

  try {
    // Format structured data for prompt
    const structuredDataText = formatStructuredData(
      structuredCV,
      structuredJobDescription,
      structuredCandidateDetails
    );

    // Create section-specific prompt
    const sectionName = "ACTIONABLE NEXT STEPS";
    const sectionDescription =
      "specific, practical actions the candidate can take to improve their interview performance and career prospects";

    // Replace placeholders in the user prompt
    const enhancedUserPrompt = BASE_USER_PROMPT.replace("{{SECTION_NAME}}", sectionName)
      .replace("{{STRUCTURED_DATA}}", structuredDataText)
      .replace("{{TRANSCRIPT}}", JSON.stringify(transcript))
      .replace("{{CV}}", cvText || "Not provided")
      .replace("{{JD}}", jobDescriptionText || "Not provided")
      .replace("{{ADDITIONAL_INFO}}", additionalInfo || "None");

    // Add section-specific instructions
    const sectionPrompt = `${enhancedUserPrompt}

SPECIFIC GUIDANCE FOR ACTIONABLE NEXT STEPS:

Your task is to provide 5-7 specific, practical next steps that the candidate can take to improve their interview performance and enhance their career prospects. For each next step:

1. CLARITY AND SPECIFICITY:
   - Provide concrete, detailed guidance that can be immediately implemented
   - Avoid vague recommendations like "improve communication skills"
   - Include specific techniques, resources, or actions

2. EVIDENCE-BASED RECOMMENDATIONS:
   - Base each recommendation directly on evidence from the interview transcript
   - Connect each action item to specific performance gaps or opportunities identified
   - Reference particular moments or responses that indicate the need for this action

3. PRIORITIZATION AND IMPACT:
   - Focus on high-impact improvements that will yield significant results
   - Prioritize actions based on their relevance to the specific role
   - Balance immediate improvements for interviews with longer-term career development

4. MEASURABILITY AND TRACKING:
   - Include ways the candidate can measure their progress or improvement
   - Suggest specific metrics, feedback mechanisms, or self-assessment techniques
   - Provide timeframes or milestones where appropriate

5. RESOURCE INCLUSION:
   - Recommend specific books, courses, tools, or other resources where helpful
   - Suggest practice exercises, role-playing scenarios, or preparation techniques
   - Include mentor or coaching suggestions where appropriate

FORMAT REQUIREMENTS:
- Present 5-7 clear, actionable next steps
- Format each step with a concise action-oriented title, then 1-2 paragraphs of explanation
- Make each step distinctive and focused on a different area for improvement
- Ensure steps are practical and realistic for the candidate to implement
- Phrase recommendations positively and constructively
- Structure from highest to lowest priority

Remember that this section should leave the candidate with a clear roadmap for improvement that feels achievable, motivating, and directly relevant to their specific situation.
`;

    // Generate the structured output
    const { object: structuredOutput, usage } = await generateObject({
      model,
      schema: ActionableNextStepsSchema,
      schemaName: "actionableNextStepsAnalysis",
      schemaDescription: `Analysis of ${sectionDescription}`,
      system: BASE_SYSTEM_PROMPT,
      prompt: sectionPrompt,
      temperature: 1,
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
      scope.setExtra("context", "analyzeActionableNextSteps");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error analyzing actionable next steps"
    );
    throw error;
  }
}
