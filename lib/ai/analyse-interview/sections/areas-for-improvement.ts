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

Your task is to identify 3-5 specific development areas where the candidate could improve based on their interview performance. For each area:

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
- Identify 3-5 specific, actionable improvement areas (not vague critiques like "needs better communication")
- For each area, provide a concise title/label, then 1-2 paragraphs of analysis
- Include direct quotes or specific examples from the transcript for each area
- Make each improvement area distinctive - avoid overlapping or redundant feedback
- Balance candor with empathy - be direct but not harsh in your assessment
- Ensure feedback is actionable - focus on aspects the candidate can realistically improve

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
        prompt_tokens: usage.promptTokens,
        completion_tokens: usage.completionTokens,
        total_tokens: usage.promptTokens + usage.completionTokens,
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
