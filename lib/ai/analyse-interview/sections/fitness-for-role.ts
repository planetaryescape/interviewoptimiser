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
      "how well the candidate's skills, experience, and characteristics align with the specific role requirements";

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

1. SKILL ALIGNMENT:
   - How well do the candidate's demonstrated skills match the specific requirements of the role?
   - Are there any critical skill gaps that would impact their ability to perform effectively?
   - Did they provide evidence of skills that exceed the basic requirements in valuable ways?

2. EXPERIENCE RELEVANCE:
   - How closely does their past experience align with the responsibilities of this position?
   - Did they demonstrate understanding of the industry, market, or specific challenges?
   - Have they successfully handled similar responsibilities or challenges in the past?

3. MOTIVATION & INTEREST:
   - Did they articulate genuine interest in this specific role, company, or industry?
   - Did they demonstrate understanding of why this role fits their career path?
   - Did they ask insightful questions about the position or express enthusiasm?

4. CULTURAL ALIGNMENT:
   - Based on their values and working style, how well might they fit the company culture?
   - Did they demonstrate awareness of the company's mission, values, or culture?
   - Are there any significant misalignments in work style or expectations?

5. GROWTH POTENTIAL:
   - Did they show capacity to develop in areas where they may currently have gaps?
   - Did they demonstrate learning agility and adaptability relevant to the role?
   - How might their career trajectory align with future needs of the role/team?

6. COMPARATIVE ADVANTAGE:
   - What unique strengths or perspectives might they bring to this specific position?
   - How do their attributes compare to typical candidates for similar roles?
   - Did they demonstrate any exceptional qualities particularly valuable for this position?

IMPORTANT REMINDER ABOUT COVERAGE:
- Only assess how the candidate fits role requirements that were actually discussed in the interview
- For requirements mentioned in the job description but not covered in the interview, clearly state: "This requirement was not covered in the interview"
- If you make inferences about fitness for aspects of the role not directly discussed, clearly explain your reasoning based on specific evidence from the transcript
- Focus your assessment on demonstrated skills and qualities, not assumptions about what they might know or do

Remember to reference specific examples from the transcript for each point in your assessment. Consider the context of the role when evaluating responses, and focus on alignment rather than absolute performance.
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
