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

1. CLARITY AND STRUCTURE:
   - How clearly did the candidate convey complex ideas or processes?
   - Did they use logical structure and organization in their responses?
   - Were their explanations easy to follow and understand?

2. LISTENING AND RESPONSIVENESS:
   - Did they directly answer the questions asked?
   - Did they demonstrate active listening through their responses?
   - How well did they adapt when clarification was needed?

3. CONCISENESS AND PRECISION:
   - Did they get to the point effectively or ramble unnecessarily?
   - Did they communicate with appropriate level of detail?
   - How efficient was their use of language and time?

4. TECHNICAL COMMUNICATION:
   - How effectively did they explain technical concepts or specialized knowledge?
   - Could they translate complex topics for different audiences?
   - Did they use technical terminology appropriately?

5. CONFIDENCE AND PRESENCE:
   - Did they communicate with appropriate confidence and authority?
   - How was their verbal presence and impact?
   - Did their communication style inspire trust and credibility?

6. INTERPERSONAL AWARENESS:
   - How attuned were they to the interview dynamic?
   - Did they demonstrate emotional intelligence in their communication?
   - How effectively did they build rapport through their communication style?

FORMAT REQUIREMENTS:
- Format your entire response in proper Markdown
- Use headings (## and ###) for clear organization
- Use bullet points (*) for listing items
- Use bold (**text**) and italic (*text*) for emphasis
- Include direct quotes from the transcript in blockquotes (> quote)

IMPORTANT REMINDER ABOUT COVERAGE:
- Only assess communication aspects that were actually demonstrated in the interview
- Focus on language, organization, clarity, listening, and responsiveness
- Be careful to distinguish between communication skills and other aspects like technical knowledge
- If a candidate is not a native speaker, be sure to distinguish between language proficiency issues and actual communication skill deficiencies

Remember to reference specific examples from the transcript for each point in your assessment. Pay particular attention to how the candidate structured responses, handled challenging questions, and adapted their communication style throughout the interview.
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
