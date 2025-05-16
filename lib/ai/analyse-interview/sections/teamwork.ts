import * as Sentry from "@sentry/nextjs";
import { generateObject } from "ai";
import { logger } from "~/lib/logger";
import { BASE_SYSTEM_PROMPT, BASE_USER_PROMPT } from "../prompts";
import { type TeamworkAnalysis, TeamworkSchema } from "../schemas";
import type { AnalysisSectionResult, BaseAnalyzeParams } from "../types";
import { createRequestHeaders, formatStructuredData } from "../utils";

/**
 * Analyzes the candidate's teamwork abilities based on the interview transcript
 * @param params - Common parameters for analysis
 * @returns Analysis of teamwork abilities with usage information
 */
export async function analyzeTeamwork({
  model,
  transcript,
  userEmail,
  structuredCV,
  structuredJobDescription,
  structuredCandidateDetails,
  cvText,
  jobDescriptionText,
  additionalInfo,
}: BaseAnalyzeParams): Promise<AnalysisSectionResult<TeamworkAnalysis>> {
  logger.info("Analyzing candidate's teamwork abilities");

  try {
    // Format structured data for prompt
    const structuredDataText = formatStructuredData(
      structuredCV,
      structuredJobDescription,
      structuredCandidateDetails
    );

    // Create section-specific prompt
    const sectionName = "TEAMWORK";
    const sectionDescription =
      "the candidate's ability to collaborate effectively with others and contribute to team success";

    // Replace placeholders in the user prompt
    const enhancedUserPrompt = BASE_USER_PROMPT.replace("{{SECTION_NAME}}", sectionName)
      .replace("{{STRUCTURED_DATA}}", structuredDataText)
      .replace("{{TRANSCRIPT}}", JSON.stringify(transcript))
      .replace("{{CV}}", cvText || "Not provided")
      .replace("{{JD}}", jobDescriptionText || "Not provided")
      .replace("{{ADDITIONAL_INFO}}", additionalInfo || "None");

    // Add section-specific instructions
    const sectionPrompt = `${enhancedUserPrompt}

SPECIFIC GUIDANCE FOR TEAMWORK ASSESSMENT:

Your analysis for this section should be well-supported by specific examples and quotes, aiming for approximately 400-500 words. Evaluate the candidate's teamwork capabilities based on the following dimensions:

1. COLLABORATION STYLE:
   - How does the candidate describe their approach to working with others?
   - Did they demonstrate a willingness to share credit and acknowledge team contributions?
   - What evidence suggests they can adapt their style to different team dynamics?

2. CONFLICT RESOLUTION:
   - How did they handle disagreements or conflicts in their examples?
   - Did they show empathy and understanding of different perspectives?
   - What strategies did they use to find common ground or compromise?

3. COMMUNICATION IN TEAMS:
   - How effectively did they describe communicating within teams?
   - Did they demonstrate active listening and consideration of others' input?
   - What evidence suggests they can communicate across different roles and levels?

4. LEADERSHIP AND FOLLOWERSHIP:
   - Did they demonstrate appropriate leadership qualities when needed?
   - How well did they function as a team member when not in a leadership role?
   - What evidence suggests they can balance autonomy with team cohesion?

5. CONTRIBUTION AWARENESS:
   - How clear is their understanding of their own strengths and contributions?
   - Did they appropriately credit team members in their examples?
   - Do they show awareness of how their work affects others?

FORMAT REQUIREMENTS:
- Format your entire response in proper Markdown
- Use headings (## and ###) for clear organization
- Use bullet points (*) for listing items
- Use bold (**text**) and italic (*text*) for emphasis
- Include direct quotes from the transcript in blockquotes (> quote)

IMPORTANT REMINDER ABOUT COVERAGE:
- Only assess teamwork aspects that were actually discussed in the interview
- If teamwork was not explicitly explored, state this clearly
- Focus your analysis on concrete examples the candidate shared about past team experiences
- If making inferences about teamwork skills not directly discussed, explain your reasoning and cite specific evidence

Remember to reference specific examples from the transcript for each point in your assessment. Look for instances where the candidate describes how they've worked in teams, handled collaboration challenges, or contributed to collective outcomes.
`;

    // Generate the structured output
    const { object: structuredOutput, usage } = await generateObject({
      model,
      schema: TeamworkSchema,
      schemaName: "teamworkAnalysis",
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
      scope.setExtra("context", "analyzeTeamwork");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error analyzing teamwork abilities"
    );
    throw error;
  }
}
