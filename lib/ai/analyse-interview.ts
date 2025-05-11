import * as Sentry from "@sentry/nextjs";
import type { CompletionUsage } from "openai/resources/completions.mjs";
import { logger } from "~/lib/logger";
import { analyseInterview as newAnalyseInterview } from "./analyse-interview/index";
import type { InterviewReport } from "./analyse-interview/schemas";
import type { AnalyseInterviewParams, QuestionAnalysisData } from "./analyse-interview/types";

/**
 * Generates a detailed analysis report for an interview using the modular approach
 * @param params - Object containing all parameters for the analysis
 * @returns A structured report with scores, analysis, question analyses and usage information
 */
export async function analyseInterview(params: AnalyseInterviewParams): Promise<{
  data: InterviewReport;
  usage: CompletionUsage;
  questionAnalyses: QuestionAnalysisData[];
}> {
  logger.info("Generating interview analysis report using modular approach");

  try {
    // Use the new modular implementation
    const { data, questionAnalyses, usage } = await newAnalyseInterview(params);

    // If we have question analyses, log them
    if (questionAnalyses && questionAnalyses.length > 0) {
      logger.info(
        `Found ${questionAnalyses.length} question analyses, will be saved in the calling function`
      );
    }

    return {
      data,
      usage,
      questionAnalyses,
    };
  } catch (error) {
    // Log the error and rethrow it to be handled by the lambda
    Sentry.withScope((scope) => {
      scope.setExtra("context", "analyseInterview");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error generating interview analysis report"
    );
    throw error;
  }
}
