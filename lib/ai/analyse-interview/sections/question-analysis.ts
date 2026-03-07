import * as Sentry from "@sentry/nextjs";
import { generateObject } from "ai";
import { logger } from "~/lib/logger";
import { BASE_SYSTEM_PROMPT, QUESTION_ANALYSIS_PROMPT } from "../prompts";
import { QuestionAnalysisSchema, type QuestionAnalysisType } from "../schemas";
import type { AnalysisSectionResult, BaseAnalyzeParams } from "../types";
import { createRequestHeaders, formatStructuredData } from "../utils";

/**
 * Interface for analyze key question params
 */
interface AnalyzeKeyQuestionParams extends BaseAnalyzeParams {
  /**
   * The key question to analyze
   */
  question: string;
}

/**
 * Analyzes how the candidate answered a specific key question
 * @param params - Parameters including the specific question to analyze
 * @returns Analysis of the question response with usage information
 */
export async function analyzeKeyQuestion({
  model,
  transcript,
  userEmail,
  structuredCV,
  structuredJobDescription,
  structuredCandidateDetails,
  question,
}: AnalyzeKeyQuestionParams): Promise<AnalysisSectionResult<QuestionAnalysisType>> {
  logger.info(`Analyzing candidate's response to key question: "${question.substring(0, 50)}..."`);

  try {
    // Format structured data for prompt
    const structuredDataText = formatStructuredData(
      structuredCV,
      structuredJobDescription,
      structuredCandidateDetails
    );

    // Replace placeholders in the user prompt
    const questionPrompt = `${QUESTION_ANALYSIS_PROMPT.replace(
      "{{STRUCTURED_DATA}}",
      structuredDataText
    )
      .replace("{{TRANSCRIPT}}", JSON.stringify(transcript))
      .replace(/{{QUESTION}}/g, question)}

FORMAT REQUIREMENTS:
- Format your entire response in proper Markdown
- Use headings (## and ###) for clear organization
- Use bullet points (*) for listing items
- Use bold (**text**) and italic (*text*) for emphasis
- Include direct quotes from the transcript in blockquotes (> quote)`;

    // Generate the structured output
    const { object: structuredOutput, usage } = await generateObject({
      model,
      schema: QuestionAnalysisSchema,
      schemaName: "questionAnalysis",
      schemaDescription: "Analysis of candidate's response to a specific key question",
      system: BASE_SYSTEM_PROMPT,
      prompt: questionPrompt,
      temperature: 1,
      headers: createRequestHeaders(userEmail),
    });

    // Ensure the question is included in the output
    const result = {
      ...structuredOutput,
      question,
      isKeyQuestion: true,
    };

    return {
      data: result,
      usage: {
        prompt_tokens: usage.inputTokens ?? 0,
        completion_tokens: usage.outputTokens ?? 0,
        total_tokens: (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
      },
    };
  } catch (error) {
    // Log the error and rethrow it
    Sentry.withScope((scope) => {
      scope.setExtra("context", "analyzeKeyQuestion");
      scope.setExtra("question", question);
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : error,
        error,
        question,
      },
      "Error analyzing key question response"
    );
    throw error;
  }
}

/**
 * Analyzes a batch of key questions from the job description
 * @param params - Base analysis parameters
 * @param questions - Array of key questions to analyze
 * @returns Array of question analysis results and combined usage
 */
export async function analyzeKeyQuestions(
  params: BaseAnalyzeParams,
  questions: string[]
): Promise<{
  data: QuestionAnalysisType[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}> {
  logger.info(`Analyzing ${questions.length} key questions`);

  try {
    // Process each question in parallel
    const results = await Promise.all(
      questions.map((question) => analyzeKeyQuestion({ ...params, question }))
    );

    // Combine usage stats
    const usage = {
      prompt_tokens: results.reduce((sum, result) => sum + result.usage.prompt_tokens, 0),
      completion_tokens: results.reduce((sum, result) => sum + result.usage.completion_tokens, 0),
      total_tokens: results.reduce((sum, result) => sum + result.usage.total_tokens, 0),
    };

    return {
      data: results.map((result) => result.data),
      usage,
    };
  } catch (error) {
    // Log the error and rethrow it
    Sentry.withScope((scope) => {
      scope.setExtra("context", "analyzeKeyQuestions");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error analyzing key questions"
    );
    throw error;
  }
}
