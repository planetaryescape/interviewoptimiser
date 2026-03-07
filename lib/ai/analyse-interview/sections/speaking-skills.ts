import * as Sentry from "@sentry/nextjs";
import { generateObject } from "ai";
import { logger } from "~/lib/logger";
import { BASE_SYSTEM_PROMPT, BASE_USER_PROMPT } from "../prompts";
import { type SpeakingSkillsAnalysis, SpeakingSkillsSchema } from "../schemas";
import type { AnalysisSectionResult, BaseAnalyzeParams } from "../types";
import { createRequestHeaders, formatStructuredData } from "../utils";

/**
 * Analyzes the candidate's speaking skills based on the interview transcript
 * @param params - Common parameters for analysis
 * @returns Analysis of speaking skills with usage information
 */
export async function analyzeSpeakingSkills({
  model,
  transcript,
  userEmail,
  structuredCV,
  structuredJobDescription,
  structuredCandidateDetails,
  cvText,
  jobDescriptionText,
  additionalInfo,
}: BaseAnalyzeParams): Promise<AnalysisSectionResult<SpeakingSkillsAnalysis>> {
  logger.info("Analyzing candidate's speaking skills");

  try {
    // Format structured data for prompt
    const structuredDataText = formatStructuredData(
      structuredCV,
      structuredJobDescription,
      structuredCandidateDetails
    );

    // Create section-specific prompt
    const sectionName = "SPEAKING SKILLS";
    const sectionDescription =
      "the candidate's verbal communication delivery, including clarity, fluency, pace, and vocal quality";

    // Replace placeholders in the user prompt
    const enhancedUserPrompt = BASE_USER_PROMPT.replace("{{SECTION_NAME}}", sectionName)
      .replace("{{STRUCTURED_DATA}}", structuredDataText)
      .replace("{{TRANSCRIPT}}", JSON.stringify(transcript))
      .replace("{{CV}}", cvText || "Not provided")
      .replace("{{JD}}", jobDescriptionText || "Not provided")
      .replace("{{ADDITIONAL_INFO}}", additionalInfo || "None");

    // Add section-specific instructions
    const sectionPrompt = `${enhancedUserPrompt}

SPECIFIC GUIDANCE FOR SPEAKING SKILLS ASSESSMENT:

Your analysis for this section should be focused and provide specific examples, aiming for approximately 300-400 words. Address the following aspects of the candidate's verbal delivery:

1. VOCAL CLARITY ASSESSMENT:
   - Was the candidate's speech clear and understandable?
   - Did they articulate complex ideas effectively?
   - Were there issues with pronunciation or enunciation?

2. FLUENCY AND PACE ANALYSIS:
   - Did the candidate speak at an appropriate pace?
   - Were there excessive pauses, hesitations, or filler words (um, uh, like)?
   - How smooth was their delivery overall?

3. PROSODY EVALUATION (using prosody data):
   - What emotions were detected in the candidate's voice?
   - Were there signs of nervousness, confidence, or enthusiasm?
   - Did their tone match the content of their answers?

4. ENGAGEMENT ANALYSIS:
   - Did the candidate's voice maintain listener interest?
   - Was there appropriate variation in pitch, tone, and emphasis?
   - Did they sound engaged and interested in the conversation?

5. ROLE-SPECIFIC CONSIDERATIONS:
   - How important are polished speaking skills for this specific role?
   - Would any speaking issues identified impact job performance?
   - What specific speaking improvements would benefit this candidate most?

PAY SPECIAL ATTENTION TO THE PROSODY DATA in the transcript, which contains AI-detected emotional cues from the candidate's voice. Use this data to distinguish between content issues and delivery issues.

FORMAT REQUIREMENTS:
- Format your entire response in proper Markdown
- Use headings (## and ###) for clear organization
- Use bullet points (*) for listing items
- Use bold (**text**) and italic (*text*) for emphasis
- Include direct quotes from the transcript in blockquotes (> quote)

Remember to reference specific examples from the transcript for each point in your assessment. Be detailed in your analysis of the candidate's speaking style, tone, pace, clarity, and overall verbal effectiveness.
`;

    // Generate the structured output
    const { object: structuredOutput, usage } = await generateObject({
      model,
      schema: SpeakingSkillsSchema,
      schemaName: "speakingSkillsAnalysis",
      schemaDescription: `Analysis of ${sectionDescription}`,
      system: BASE_SYSTEM_PROMPT,
      prompt: sectionPrompt,
      temperature: 1,
      headers: createRequestHeaders(userEmail),
    });

    return {
      data: structuredOutput,
      usage: {
        prompt_tokens: usage.promptTokens ?? 0,
        completion_tokens: usage.completionTokens ?? 0,
        total_tokens: (usage.promptTokens ?? 0) + (usage.completionTokens ?? 0),
      },
    };
  } catch (error) {
    // Log the error and rethrow it
    Sentry.withScope((scope) => {
      scope.setExtra("context", "analyzeSpeakingSkills");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error analyzing speaking skills"
    );
    throw error;
  }
}
