import * as Sentry from "@sentry/nextjs";
import { generateObject } from "ai";
import { logger } from "~/lib/logger";
import { BASE_SYSTEM_PROMPT, BASE_USER_PROMPT } from "../prompts";
import { type AreasForImprovementAnalysis, AreasForImprovementSchema } from "../schemas";
import type { AnalysisSectionResult, BaseAnalyzeParams } from "../types";
import { createRequestHeaders, formatStructuredData } from "../utils";

/**
 * Analyzes the candidate's areas for improvement based on the interview transcript
 * @param params - Common parameters for analysis
 * @returns Analysis of areas for improvement with usage information
 */
export async function analyzeAreasForImprovement({
  model,
  transcript,
  userEmail,
  structuredCV,
  structuredJobDescription,
  structuredCandidateDetails,
  cvText,
  jobDescriptionText,
  additionalInfo,
}: BaseAnalyzeParams): Promise<AnalysisSectionResult<AreasForImprovementAnalysis>> {
  logger.info("Analyzing candidate's areas for improvement");

  try {
    // Format structured data for prompt
    const structuredDataText = formatStructuredData(
      structuredCV,
      structuredJobDescription,
      structuredCandidateDetails
    );

    // Create section-specific prompt
    const sectionName = "AREAS FOR IMPROVEMENT";
    const sectionDescription =
      "the specific aspects where the candidate could enhance their skills, approach, or presentation";

    // Replace placeholders in the user prompt
    const enhancedUserPrompt = BASE_USER_PROMPT.replace("{{SECTION_NAME}}", sectionName)
      .replace("{{STRUCTURED_DATA}}", structuredDataText)
      .replace("{{TRANSCRIPT}}", JSON.stringify(transcript))
      .replace("{{CV}}", cvText || "Not provided")
      .replace("{{JD}}", jobDescriptionText || "Not provided")
      .replace("{{ADDITIONAL_INFO}}", additionalInfo || "None");

    // Add section-specific instructions
    const sectionPrompt = `${enhancedUserPrompt}

SPECIFIC GUIDANCE FOR AREAS FOR IMPROVEMENT ASSESSMENT:

Your task is to identify 3-5 specific development areas where the candidate could improve based on their interview performance. For each area, provide a detailed and evidence-based explanation, aiming for a total of approximately 300-500 words for this section. Ensure your analysis covers:

1. EVIDENCE-BASED IDENTIFICATION:
   - What clear evidence from the transcript indicates this as an area needing development?
   - What specific examples or quotes illustrate this development need?
   - How did this gap manifest in their responses or approach?

2. JOB RELEVANCE ASSESSMENT:
   - How significant is this development area for success in the specific role?
   - Which aspects of the job might be negatively impacted by this gap?
   - Is this a critical improvement needed for baseline performance, or more of an enhancement for excellence?

3. IMPACT ANALYSIS:
   - What potential challenges or limitations might result if this area isn't improved?
   - How might this gap affect team dynamics, project outcomes, or organizational results?
   - What opportunities might be missed if this development area isn't addressed?

4. CONSTRUCTIVE FRAMING:
   - How can this development need be framed as an opportunity rather than a deficit?
   - What positive outcomes could result from focusing on this improvement area?
   - How does this improvement area connect to the candidate's existing strengths?

FORMAT REQUIREMENTS:
- Format your entire response in proper Markdown
- Use headings (## and ###) for clear organization
- Use bullet points (*) for listing items
- Use bold (**text**) and italic (*text*) for emphasis
- Include direct quotes from the transcript in blockquotes (> quote)

IMPORTANT:
- Focus on 3-5 distinct, significant areas for improvement rather than minor issues
- For each area identified, clearly explain the impact it would have on job performance
- Provide concrete examples from the transcript that demonstrate each weakness
- Be forthright and direct about serious concerns - don't soften critical feedback
- If there are few areas for improvement, acknowledge the candidate's strengths but still identify the relative weaknesses

Remember to maintain the principles of Radical Candor - be honest about development needs while showing you care about the candidate's growth and success.
`;

    // Generate the structured output
    const { object: structuredOutput, usage } = await generateObject({
      model,
      schema: AreasForImprovementSchema,
      schemaName: "areasForImprovementAnalysis",
      schemaDescription: `Analysis of ${sectionDescription}`,
      system: BASE_SYSTEM_PROMPT,
      prompt: sectionPrompt,
      temperature: 1,
      headers: createRequestHeaders(userEmail),
    });

    return {
      data: structuredOutput,
      usage: {
        prompt_tokens: usage.inputTokens ?? 0,
        completion_tokens: usage.outputTokens ?? 0,
        total_tokens: (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
      },
    };
  } catch (error) {
    // Log the error and rethrow it
    Sentry.withScope((scope) => {
      scope.setExtra("context", "analyzeAreasForImprovement");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error analyzing areas for improvement"
    );
    throw error;
  }
}
