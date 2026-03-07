import * as Sentry from "@sentry/nextjs";
import { generateObject } from "ai";
import { logger } from "~/lib/logger";
import { BASE_SYSTEM_PROMPT, BASE_USER_PROMPT } from "../prompts";
import { type AreasOfStrengthAnalysis, AreasOfStrengthSchema } from "../schemas";
import type { AnalysisSectionResult, BaseAnalyzeParams } from "../types";
import { createRequestHeaders, formatStructuredData } from "../utils";

/**
 * Analyzes the candidate's areas of strength based on the interview transcript
 * @param params - Common parameters for analysis
 * @returns Analysis of areas of strength with usage information
 */
export async function analyzeAreasOfStrength({
  model,
  transcript,
  userEmail,
  structuredCV,
  structuredJobDescription,
  structuredCandidateDetails,
  cvText,
  jobDescriptionText,
  additionalInfo,
}: BaseAnalyzeParams): Promise<AnalysisSectionResult<AreasOfStrengthAnalysis>> {
  logger.info("Analyzing candidate's areas of strength");

  try {
    // Format structured data for prompt
    const structuredDataText = formatStructuredData(
      structuredCV,
      structuredJobDescription,
      structuredCandidateDetails
    );

    // Create section-specific prompt
    const sectionName = "AREAS OF STRENGTH";
    const sectionDescription =
      "the candidate's most notable capabilities, skills, and qualities demonstrated during the interview";

    // Replace placeholders in the user prompt
    const enhancedUserPrompt = BASE_USER_PROMPT.replace("{{SECTION_NAME}}", sectionName)
      .replace("{{STRUCTURED_DATA}}", structuredDataText)
      .replace("{{TRANSCRIPT}}", JSON.stringify(transcript))
      .replace("{{CV}}", cvText || "Not provided")
      .replace("{{JD}}", jobDescriptionText || "Not provided")
      .replace("{{ADDITIONAL_INFO}}", additionalInfo || "None");

    // Add section-specific instructions
    const sectionPrompt = `${enhancedUserPrompt}

SPECIFIC GUIDANCE FOR AREAS OF STRENGTH ASSESSMENT:

Your task is to identify 3-5 specific strengths demonstrated by the candidate during the interview. For each strength, provide a detailed explanation including evidence, relevance, and impact. Aim for a total length of approximately 300-500 words for this section. Ensure your analysis covers:

1. EVIDENCE-BASED IDENTIFICATION:
   - What clear evidence from the transcript supports this as a genuine strength?
   - How consistently was this strength demonstrated throughout the interview?
   - What specific examples or quotes illustrate this strength in action?

2. RELEVANCE TO ROLE:
   - How directly does this strength align with key requirements for the specific role?
   - What aspects of the job would benefit most from this particular strength?
   - How might this strength differentiate the candidate from others with similar qualifications?

3. IMPACT ANALYSIS:
   - What tangible value could this strength bring to the organization?
   - How might this strength contribute to team or organizational success?
   - What potential long-term benefits might result from this strength?

4. STRENGTH CLASSIFICATION:
   - Is this a technical skill, soft skill, character trait, or experience-based strength?
   - Is this strength fully developed or still emerging with further potential?
   - Is this an uncommon or particularly valuable strength in the candidate's field?

FORMAT REQUIREMENTS:
- Format your entire response in proper Markdown
- Use headings (## and ###) for clear organization
- Use bullet points (*) for listing items
- Use bold (**text**) and italic (*text*) for emphasis
- Include direct quotes from the transcript in blockquotes (> quote)

IMPORTANT:
- Identify 3-5 distinct, significant strengths supported by clear evidence
- For each strength, explain why it matters for this specific role
- Provide concrete examples from the transcript that demonstrate each strength
- Be specific rather than general - "excellent Python programming skills" rather than "good technical skills"
- If the candidate has exceptional strengths, don't hesitate to highlight truly outstanding qualities

Remember this section will be one of the most valuable for the candidate. Be specific, evidence-based, and focused on strengths that would genuinely matter in the workplace context.
`;

    // Generate the structured output
    const { object: structuredOutput, usage } = await generateObject({
      model,
      schema: AreasOfStrengthSchema,
      schemaName: "areasOfStrengthAnalysis",
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
      scope.setExtra("context", "analyzeAreasOfStrength");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error analyzing areas of strength"
    );
    throw error;
  }
}
