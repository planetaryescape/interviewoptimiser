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

4. FLEXIBILITY IN APPROACH:
   - Did they demonstrate willingness to adjust methods or processes when necessary?
   - How did they respond when their initial approaches didn't work?
   - What evidence suggests they can balance consistency with necessary adaptation?

5. RESILIENCE UNDER PRESSURE:
   - How did they handle setbacks, failures, or unexpected obstacles?
   - Did they demonstrate emotional regulation during challenging situations?
   - What coping mechanisms or recovery strategies did they employ?

6. CULTURAL ADAPTABILITY:
   - Did they show capability to work effectively across different organizational cultures?
   - How did they adapt their communication or work style to different environments?
   - What evidence suggests they can thrive in diverse or global contexts?

Remember to reference specific examples from the transcript for each point in your assessment. Look for instances where the candidate discusses how they've handled change, uncertainty, or new challenges, as well as their approach to learning and growth.
`;

    // Generate the structured output
    const { object: structuredOutput, usage } = await generateObject({
      model,
      schema: AdaptabilitySchema,
      schemaName: "adaptabilityAnalysis",
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
