import * as Sentry from "@sentry/nextjs";
import { generateObject } from "ai";
import { logger } from "~/lib/logger";
import { BASE_SYSTEM_PROMPT, BASE_USER_PROMPT } from "../prompts";
import { type FitnessForRoleAnalysis, FitnessForRoleSchema } from "../schemas";
import type { AnalysisSectionResult, BaseAnalyzeParams } from "../types";
import { createRequestHeaders, formatStructuredData } from "../utils";

/**
 * Analyzes the candidate's fitness for the role based on the interview transcript
 * @param params - Common parameters for analysis
 * @returns Analysis of fitness for role with usage information
 */
export async function analyzeFitnessForRole({
  model,
  transcript,
  userEmail,
  structuredCV,
  structuredJobDescription,
  structuredCandidateDetails,
  cvText,
  jobDescriptionText,
  additionalInfo,
}: BaseAnalyzeParams): Promise<AnalysisSectionResult<FitnessForRoleAnalysis>> {
  logger.info("Analyzing candidate's fitness for role");

  try {
    // Format structured data for prompt
    const structuredDataText = formatStructuredData(
      structuredCV,
      structuredJobDescription,
      structuredCandidateDetails
    );

    // Create section-specific prompt
    const sectionName = "FITNESS FOR ROLE";
    const sectionDescription =
      "how well the candidate's skills, experience, and characteristics align with the specific role requirements";

    // Replace placeholders in the user prompt
    const enhancedUserPrompt = BASE_USER_PROMPT.replace("{{SECTION_NAME}}", sectionName)
      .replace("{{STRUCTURED_DATA}}", structuredDataText)
      .replace("{{TRANSCRIPT}}", JSON.stringify(transcript))
      .replace("{{CV}}", cvText || "Not provided")
      .replace("{{JD}}", jobDescriptionText || "Not provided")
      .replace("{{ADDITIONAL_INFO}}", additionalInfo || "None");

    // Add section-specific instructions
    const sectionPrompt = `${enhancedUserPrompt}

SPECIFIC GUIDANCE FOR FITNESS FOR ROLE ASSESSMENT:

Your analysis for this section should be detailed and comprehensive, aiming for approximately 400-600 words. Elaborate on each of the following aspects, using specific examples and quotes from the transcript:

1. TECHNICAL COMPETENCY MATCH:
   - How well do the candidate's demonstrated technical skills align with role requirements?
   - Are there any critical technical gaps or areas of exceptional strength?
   - Is their technical experience relevant to the specific challenges of this position?

2. EXPERIENCE ALIGNMENT:
   - How closely does their past experience match the responsibilities of this role?
   - Have they worked in similar environments or contexts?
   - Do they have exposure to the specific tools, systems, or methodologies required?

3. SOFT SKILLS FIT:
   - How well do their interpersonal and workplace skills align with role demands?
   - Do they demonstrate the collaboration style needed for this team?
   - Are their communication abilities appropriate for this position?

4. PROBLEM-SOLVING APPROACH:
   - Is their problem-solving style suitable for the challenges in this role?
   - Do they demonstrate appropriate analytical abilities?
   - Can they balance speed and thoroughness in their approach to problems?

5. CULTURAL ALIGNMENT:
   - How well might they integrate with the company culture?
   - Do their values and working style appear compatible with the organization?
   - Would they likely thrive in this specific work environment?

6. GROWTH POTENTIAL:
   - Do they demonstrate ability to learn and adapt in areas where they lack experience?
   - How quickly could they become productive in this role?
   - Do they show long-term potential beyond the immediate position?

FORMAT REQUIREMENTS:
- Format your entire response in proper Markdown
- Use headings (## and ###) for clear organization
- Use bullet points (*) for listing items
- Use bold (**text**) and italic (*text*) for emphasis
- Include direct quotes from the transcript in blockquotes (> quote)

IMPORTANT REMINDER ABOUT COVERAGE:
- Only assess fitness aspects that were actually covered in the interview
- For areas not sufficiently explored, clearly state that they couldn't be properly evaluated
- Identify both specific strengths that would enhance performance and weaknesses that might impact success
- Consider the relative importance of different skills for this specific role
- If making inferences about aspects not directly discussed, explain your reasoning and cite specific supporting evidence

Your assessment should result in a clear, evidence-based evaluation of how well the candidate's demonstrated abilities, experience, and potential align with the requirements of this specific role.
`;

    // Generate the structured output
    const { object: structuredOutput, usage } = await generateObject({
      model,
      schema: FitnessForRoleSchema,
      schemaName: "fitnessForRoleAnalysis",
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
      scope.setExtra("context", "analyzeFitnessForRole");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error analyzing fitness for role"
    );
    throw error;
  }
}
