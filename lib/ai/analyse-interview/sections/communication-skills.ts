import * as Sentry from "@sentry/nextjs";
import { generateObject } from "ai";
import { logger } from "~/lib/logger";
import { BASE_SYSTEM_PROMPT, BASE_USER_PROMPT } from "../prompts";
import { type CommunicationSkillsAnalysis, CommunicationSkillsSchema } from "../schemas";
import type { AnalysisSectionResult, BaseAnalyzeParams } from "../types";
import { createRequestHeaders, formatStructuredData } from "../utils";

/**
 * Analyzes the candidate's communication skills based on the interview transcript
 * @param params - Common parameters for analysis
 * @returns Analysis of communication skills with usage information
 */
export async function analyzeCommunicationSkills({
  model,
  transcript,
  userEmail,
  structuredCV,
  structuredJobDescription,
  structuredCandidateDetails,
  cvText,
  jobDescriptionText,
  additionalInfo,
}: BaseAnalyzeParams): Promise<AnalysisSectionResult<CommunicationSkillsAnalysis>> {
  logger.info("Analyzing candidate's communication skills");

  try {
    // Format structured data for prompt
    const structuredDataText = formatStructuredData(
      structuredCV,
      structuredJobDescription,
      structuredCandidateDetails
    );

    // Create section-specific prompt
    const sectionName = "COMMUNICATION SKILLS";
    const sectionDescription =
      "the candidate's ability to convey information, ideas, and concepts effectively";

    // Replace placeholders in the user prompt
    const enhancedUserPrompt = BASE_USER_PROMPT.replace("{{SECTION_NAME}}", sectionName)
      .replace("{{STRUCTURED_DATA}}", structuredDataText)
      .replace("{{TRANSCRIPT}}", JSON.stringify(transcript))
      .replace("{{CV}}", cvText || "Not provided")
      .replace("{{JD}}", jobDescriptionText || "Not provided")
      .replace("{{ADDITIONAL_INFO}}", additionalInfo || "None");

    // Add section-specific instructions
    const sectionPrompt = `${enhancedUserPrompt}

SPECIFIC GUIDANCE FOR COMMUNICATION SKILLS ASSESSMENT:

1. CONTENT ORGANIZATION:
   - Did the candidate's responses have a clear structure?
   - Were complex ideas broken down effectively?
   - Did they prioritize information appropriately?

2. STORYTELLING AND EXAMPLE USE:
   - How effectively did they use concrete examples to illustrate points?
   - Were their examples relevant, specific, and impactful?
   - Did their storytelling enhance understanding of their capabilities?

3. QUESTION COMPREHENSION:
   - Did they accurately understand and address the questions asked?
   - Were clarifications needed frequently?
   - Did they stay focused on the question or tend to wander off-topic?

4. CONCISENESS AND CLARITY:
   - Were responses appropriately detailed without being overly verbose?
   - Did they avoid jargon or explain technical terms when necessary?
   - Did they communicate at the right level for their audience?

5. PERSUASIVENESS:
   - How compelling were their arguments and explanations?
   - Did they effectively advocate for their skills and experience?
   - Were they able to explain the "why" behind their actions and decisions?

6. ACTIVE LISTENING:
   - Did they demonstrate they were listening to the interviewer?
   - Did they build on previous questions or refer back to earlier points?
   - Did they adjust their communication based on feedback?

Remember to reference specific examples from the transcript for each point in your assessment. Focus specifically on the CONTENT and ORGANIZATION of their communication, as distinct from their speaking skills (which are covered in a separate section).
`;

    // Generate the structured output
    const { object: structuredOutput, usage } = await generateObject({
      model,
      schema: CommunicationSkillsSchema,
      schemaName: "communicationSkillsAnalysis",
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
      scope.setExtra("context", "analyzeCommunicationSkills");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error analyzing communication skills"
    );
    throw error;
  }
}
