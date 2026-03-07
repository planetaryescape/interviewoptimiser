import * as Sentry from "@sentry/nextjs";
import { generateObject } from "ai";
import { logger } from "~/lib/logger";
import { BASE_SYSTEM_PROMPT, BASE_USER_PROMPT } from "../prompts";
import { type TechnicalKnowledgeAnalysis, TechnicalKnowledgeSchema } from "../schemas";
import type { AnalysisSectionResult, BaseAnalyzeParams } from "../types";
import { createRequestHeaders, formatStructuredData } from "../utils";

/**
 * Analyzes the candidate's technical knowledge based on the interview transcript
 * @param params - Common parameters for analysis
 * @returns Analysis of technical knowledge with usage information
 */
export async function analyzeTechnicalKnowledge({
  model,
  transcript,
  userEmail,
  structuredCV,
  structuredJobDescription,
  structuredCandidateDetails,
  cvText,
  jobDescriptionText,
  additionalInfo,
}: BaseAnalyzeParams): Promise<AnalysisSectionResult<TechnicalKnowledgeAnalysis>> {
  logger.info("Analyzing candidate's technical knowledge");

  try {
    // Format structured data for prompt
    const structuredDataText = formatStructuredData(
      structuredCV,
      structuredJobDescription,
      structuredCandidateDetails
    );

    // Create section-specific prompt
    const sectionName = "TECHNICAL KNOWLEDGE";
    const sectionDescription =
      "the candidate's mastery of technical concepts, tools, and industry knowledge relevant to the role";

    // Replace placeholders in the user prompt
    const enhancedUserPrompt = BASE_USER_PROMPT.replace("{{SECTION_NAME}}", sectionName)
      .replace("{{STRUCTURED_DATA}}", structuredDataText)
      .replace("{{TRANSCRIPT}}", JSON.stringify(transcript))
      .replace("{{CV}}", cvText || "Not provided")
      .replace("{{JD}}", jobDescriptionText || "Not provided")
      .replace("{{ADDITIONAL_INFO}}", additionalInfo || "None");

    // Add section-specific instructions
    const sectionPrompt = `${enhancedUserPrompt}

SPECIFIC GUIDANCE FOR TECHNICAL KNOWLEDGE ASSESSMENT:

Your analysis for this section must be very detailed, citing specific examples and quotes from the transcript to support your evaluation of the candidate's technical acumen. Aim for approximately 500-700 words, covering the following areas comprehensively:

1. FOUNDATIONAL KNOWLEDGE:
   - Did the candidate demonstrate understanding of key concepts in the field?
   - Were there any significant knowledge gaps in core areas required for the role?
   - How accurate was their use of technical terminology and industry jargon?

2. TECHNICAL DEPTH:
   - How deep was their knowledge in specialized areas relevant to the role?
   - Did they provide thoughtful explanations of complex concepts?
   - Could they explain both the "what" and the "why" of technical approaches?

3. PRACTICAL APPLICATION:
   - Did they share concrete examples of applying their technical knowledge in real situations?
   - How effectively did they describe their problem-solving approach using technical tools?
   - Did they demonstrate awareness of best practices and industry standards?

4. TECHNICAL RANGE:
   - How broad was their knowledge across different aspects of the role?
   - Did they show versatility in their technical skill set?
   - Were they aware of adjacent technologies or methodologies relevant to the position?

5. CURRENT AWARENESS:
   - Did they demonstrate knowledge of current trends and developments in the field?
   - Were they familiar with up-to-date tools, technologies, and approaches?
   - Did they show interest in ongoing learning and professional development?

6. TECHNICAL COMMUNICATION:
   - How effectively did they explain technical concepts?
   - Could they adapt their technical explanations to be understandable?
   - Did they bridge technical and business perspectives effectively?

FORMAT REQUIREMENTS:
- Format your entire response in proper Markdown
- Use headings (## and ###) for clear organization
- Use bullet points (*) for listing items
- Use bold (**text**) and italic (*text*) for emphasis
- Include direct quotes from the transcript in blockquotes (> quote)

IMPORTANT REMINDER ABOUT COVERAGE:
- Only assess technical areas that were actually discussed in the interview
- For technical skills mentioned in the job description but not covered in the interview, clearly state: "This technical area was not covered in the interview"
- If a technical area was touched on but not explored in depth, explicitly note the limited evidence available
- When making inferences about technical skills not directly demonstrated, clearly explain your reasoning and provide specific evidence from the transcript

Remember to reference specific examples from the transcript for each point in your assessment. Pay particular attention to the candidate's responses to technical questions, descriptions of past projects, and explanations of their approach to technical problems.
`;

    // Generate the structured output
    const { object: structuredOutput, usage } = await generateObject({
      model,
      schema: TechnicalKnowledgeSchema,
      schemaName: "technicalKnowledgeAnalysis",
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
      scope.setExtra("context", "analyzeTechnicalKnowledge");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error analyzing technical knowledge"
    );
    throw error;
  }
}
