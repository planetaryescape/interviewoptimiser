import * as Sentry from "@sentry/nextjs";
import { generateObject } from "ai";
import { logger } from "~/lib/logger";
import { BASE_SYSTEM_PROMPT, BASE_USER_PROMPT } from "../prompts";
import { type FitnessForRoleAnalysis, FitnessForRoleSchema } from "../schemas";
import type { AnalysisSectionResult, BaseAnalyzeParams } from "../types";
import { createRequestHeaders, formatStructuredData } from "../utils";

/**
 * Analyzes the candidate's fitness for the role based on the interview transcript
 * @param params - Common parameters for analysis
 * @returns Analysis of fitness for role with usage information
 */
export async function analyzeFitnessForRole({
  model,
  transcript,
  userEmail,
  structuredCV,
  structuredJobDescription,
  structuredCandidateDetails,
  cvText,
  jobDescriptionText,
  additionalInfo,
}: BaseAnalyzeParams): Promise<AnalysisSectionResult<FitnessForRoleAnalysis>> {
  logger.info("Analyzing candidate's fitness for role");

  try {
    // Format structured data for prompt
    const structuredDataText = formatStructuredData(
      structuredCV,
      structuredJobDescription,
      structuredCandidateDetails
    );

    // Create section-specific prompt
    const sectionName = "FITNESS FOR ROLE";
    const sectionDescription =
      "the candidate's fitness for the specific role based on their experience, skills, and interview responses";

    // Replace placeholders in the user prompt
    const enhancedUserPrompt = BASE_USER_PROMPT.replace("{{SECTION_NAME}}", sectionName)
      .replace("{{STRUCTURED_DATA}}", structuredDataText)
      .replace("{{TRANSCRIPT}}", JSON.stringify(transcript))
      .replace("{{CV}}", cvText || "Not provided")
      .replace("{{JD}}", jobDescriptionText || "Not provided")
      .replace("{{ADDITIONAL_INFO}}", additionalInfo || "None");

    // Add section-specific instructions
    const sectionPrompt = `${enhancedUserPrompt}

SPECIFIC GUIDANCE FOR FITNESS FOR ROLE ASSESSMENT:

1. EVALUATE RELEVANCE OF EXPERIENCE:
   - How well does the candidate's background align with the role requirements?
   - Are there any significant gaps between their experience and what's needed?
   - Do they demonstrate understanding of the specific challenges of this role?

2. ASSESS SKILLS MATCH:
   - Which required skills did the candidate clearly demonstrate?
   - Which required skills were not evidenced or appeared weak?
   - Did they show transferable skills that could compensate for gaps?

3. CONSIDER GROWTH POTENTIAL:
   - Based on their responses, how quickly could they adapt to this role?
   - Did they demonstrate a learning mindset and adaptability?
   - What development would be needed for them to excel in this position?

4. ANALYZE CULTURAL/TEAM FIT:
   - Did their values and work style align with what's needed in this role?
   - Would their communication approach work in the target environment?
   - Are there any red flags regarding their fit within the team/organization?

Remember to reference specific examples from the transcript for each point in your assessment. Be thorough but focused specifically on role fitness.
`;

    // Generate the structured output
    const { object: structuredOutput, usage } = await generateObject({
      model,
      schema: FitnessForRoleSchema,
      schemaName: "fitnessForRoleAnalysis",
      schemaDescription: `Analysis of ${sectionDescription}`,
      system: BASE_SYSTEM_PROMPT,
      prompt: sectionPrompt,
      temperature: 0.4,
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
      scope.setExtra("context", "analyzeFitnessForRole");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error analyzing fitness for role"
    );
    throw error;
  }
}
