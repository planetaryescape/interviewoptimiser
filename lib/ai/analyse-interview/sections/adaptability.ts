import * as Sentry from "@sentry/nextjs";
import { generateObject } from "ai";
import { logger } from "~/lib/logger";
import { BASE_SYSTEM_PROMPT, BASE_USER_PROMPT } from "../prompts";
import { type AdaptabilityAnalysis, AdaptabilitySchema } from "../schemas";
import type { AnalysisSectionResult, BaseAnalyzeParams } from "../types";
import { createRequestHeaders, formatStructuredData } from "../utils";

/**
 * Analyzes the candidate's adaptability based on the interview transcript
 * @param params - Common parameters for analysis
 * @returns Analysis of adaptability with usage information
 */
export async function analyzeAdaptability({
  model,
  transcript,
  userEmail,
  structuredCV,
  structuredJobDescription,
  structuredCandidateDetails,
  cvText,
  jobDescriptionText,
  additionalInfo,
}: BaseAnalyzeParams): Promise<AnalysisSectionResult<AdaptabilityAnalysis>> {
  logger.info("Analyzing candidate's adaptability");

  try {
    // Format structured data for prompt
    const structuredDataText = formatStructuredData(
      structuredCV,
      structuredJobDescription,
      structuredCandidateDetails
    );

    // Create section-specific prompt
    const sectionName = "ADAPTABILITY";
    const sectionDescription =
      "the candidate's ability to adjust to new conditions, manage change, and thrive in ambiguous situations";

    // Replace placeholders in the user prompt
    const enhancedUserPrompt = BASE_USER_PROMPT.replace("{{SECTION_NAME}}", sectionName)
      .replace("{{STRUCTURED_DATA}}", structuredDataText)
      .replace("{{TRANSCRIPT}}", JSON.stringify(transcript))
      .replace("{{CV}}", cvText || "Not provided")
      .replace("{{JD}}", jobDescriptionText || "Not provided")
      .replace("{{ADDITIONAL_INFO}}", additionalInfo || "None");

    // Add section-specific instructions
    const sectionPrompt = `${enhancedUserPrompt}

SPECIFIC GUIDANCE FOR ADAPTABILITY ASSESSMENT:

Your analysis for this section should provide a detailed evaluation of the candidate's adaptability, using specific examples and quotes from the transcript. Aim for approximately 400-500 words, addressing the following key areas:

1. RESPONSE TO CHANGE:
   - How has the candidate handled significant workplace changes in the past?
   - Did they demonstrate a positive or resistant attitude toward change?
   - What strategies did they use to navigate transitions effectively?

2. LEARNING AGILITY:
   - How quickly did they learn new skills or adapt to new environments in their examples?
   - Did they show initiative in developing new capabilities when needed?
   - What evidence suggests they can rapidly absorb and apply new information?

3. COMFORT WITH AMBIGUITY:
   - How effectively did they operate in situations with unclear guidelines or uncertain outcomes?
   - Did they demonstrate decision-making abilities despite incomplete information?
   - What evidence suggests they can maintain productivity in fluid situations?

4. RESILIENCE:
   - How do they handle setbacks and failures?
   - Did they share examples of bouncing back from difficulties?
   - Did they demonstrate persistence in the face of obstacles?

5. CULTURAL ADAPTABILITY:
   - Did they show awareness of and sensitivity to different work cultures or styles?
   - Have they successfully worked in diverse teams or environments?
   - Did they demonstrate intercultural or contextual adaptability?

6. TECHNOLOGY ADAPTABILITY:
   - How comfortable are they with learning and adopting new technologies?
   - Did they share examples of quickly mastering new tools or platforms?
   - Did they show enthusiasm for technological change rather than resistance?

FORMAT REQUIREMENTS:
- Format your entire response in proper Markdown
- Use headings (## and ###) for clear organization
- Use bullet points (*) for listing items
- Use bold (**text**) and italic (*text*) for emphasis
- Include direct quotes from the transcript in blockquotes (> quote)

IMPORTANT REMINDER ABOUT COVERAGE:
- Only assess adaptability aspects that were actually discussed in the interview
- If adaptability was not explicitly explored, state this clearly
- Focus your analysis on concrete examples and behaviors demonstrated in the conversation
- If making inferences, explicitly state the evidence that supports your conclusions

Remember to reference specific examples from the transcript for each point in your assessment. Look for instances where the candidate describes how they handled change, learned new skills, or adjusted their approach based on new information.
`;

    // Generate the structured output
    const { object: structuredOutput, usage } = await generateObject({
      model,
      schema: AdaptabilitySchema,
      schemaName: "adaptabilityAnalysis",
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
      scope.setExtra("context", "analyzeAdaptability");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error analyzing adaptability"
    );
    throw error;
  }
}
