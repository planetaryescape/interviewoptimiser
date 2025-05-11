import * as Sentry from "@sentry/nextjs";
import { generateObject } from "ai";
import { logger } from "~/lib/logger";
import { BASE_SYSTEM_PROMPT, BASE_USER_PROMPT } from "../prompts";
import { type ProblemSolvingSkillsAnalysis, ProblemSolvingSkillsSchema } from "../schemas";
import type { AnalysisSectionResult, BaseAnalyzeParams } from "../types";
import { createRequestHeaders, formatStructuredData } from "../utils";

/**
 * Analyzes the candidate's problem-solving skills based on the interview transcript
 * @param params - Common parameters for analysis
 * @returns Analysis of problem-solving skills with usage information
 */
export async function analyzeProblemSolvingSkills({
  model,
  transcript,
  userEmail,
  structuredCV,
  structuredJobDescription,
  structuredCandidateDetails,
  cvText,
  jobDescriptionText,
  additionalInfo,
}: BaseAnalyzeParams): Promise<AnalysisSectionResult<ProblemSolvingSkillsAnalysis>> {
  logger.info("Analyzing candidate's problem-solving skills");

  try {
    // Format structured data for prompt
    const structuredDataText = formatStructuredData(
      structuredCV,
      structuredJobDescription,
      structuredCandidateDetails
    );

    // Create section-specific prompt
    const sectionName = "PROBLEM-SOLVING SKILLS";
    const sectionDescription =
      "the candidate's ability to analyze challenges, develop solutions, and implement effective approaches";

    // Replace placeholders in the user prompt
    const enhancedUserPrompt = BASE_USER_PROMPT.replace("{{SECTION_NAME}}", sectionName)
      .replace("{{STRUCTURED_DATA}}", structuredDataText)
      .replace("{{TRANSCRIPT}}", JSON.stringify(transcript))
      .replace("{{CV}}", cvText || "Not provided")
      .replace("{{JD}}", jobDescriptionText || "Not provided")
      .replace("{{ADDITIONAL_INFO}}", additionalInfo || "None");

    // Add section-specific instructions
    const sectionPrompt = `${enhancedUserPrompt}

SPECIFIC GUIDANCE FOR PROBLEM-SOLVING SKILLS ASSESSMENT:

1. ANALYTICAL APPROACH:
   - How did the candidate break down complex problems in their examples?
   - Did they identify root causes rather than just symptoms?
   - Did they demonstrate structured thinking and methodical approaches?

2. CREATIVE THINKING:
   - Did they show originality or innovative approaches in their solutions?
   - Were they able to think beyond conventional solutions?
   - Did they demonstrate ability to pivot when initial approaches didn't work?

3. PROBLEM FRAMING:
   - How effectively did they define and scope problems?
   - Did they consider constraints and resources appropriately?
   - Did they identify stakeholder needs and impacts?

4. SOLUTION DEVELOPMENT:
   - Did they present comprehensive solutions that addressed all aspects of the problem?
   - Did they evaluate multiple alternatives before selecting an approach?
   - Did they consider short and long-term implications of their solutions?

5. IMPLEMENTATION FOCUS:
   - Did they discuss practical aspects of implementing solutions?
   - Did they mention monitoring results and learning from outcomes?
   - Did they adapt to feedback or changing circumstances?

6. TECHNICAL DEPTH:
   - Did they demonstrate appropriate technical knowledge in their problem-solving approaches?
   - Were technical solutions well-reasoned and appropriate to the context?
   - Did they balance technical considerations with business needs?

Look for instances where the candidate describes past problem-solving experiences or responds to hypothetical scenarios during the interview. Pay special attention to their thought process, not just the outcomes they achieved.

Remember to reference specific examples from the transcript for each point in your assessment. Be thorough but focused specifically on problem-solving capabilities.
`;

    // Generate the structured output
    const { object: structuredOutput, usage } = await generateObject({
      model,
      schema: ProblemSolvingSkillsSchema,
      schemaName: "problemSolvingSkillsAnalysis",
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
      scope.setExtra("context", "analyzeProblemSolvingSkills");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error analyzing problem-solving skills"
    );
    throw error;
  }
}
