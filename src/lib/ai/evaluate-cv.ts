import { logger } from "@/lib/logger";
import * as Sentry from "@sentry/serverless";
import { zodResponseFormat } from "openai/helpers/zod";
import { CompletionUsage } from "openai/resources/completions.mjs";
import { z } from "zod";
import { openai } from "./openai";
import { OptimisedCVSchema } from "./optimise-cv";

// Add a new schema for the evaluation result
const EvaluationResultSchema = z.object({
  score: z.number(),
  feedback: z.array(
    z.object({
      content: z.string(), // This remains as plain text
      completed: z.boolean(),
    })
  ),
  improvedCV: OptimisedCVSchema.optional(),
});

export async function evaluateCV(
  originalCV: string,
  optimisedCV: z.infer<typeof OptimisedCVSchema>,
  jobDescription: string,
  additionalInfo: string
): Promise<{
  data: z.infer<typeof EvaluationResultSchema> | null;
  error: unknown | null;
  usage: CompletionUsage;
}> {
  logger.info("Evaluating CV");
  try {
    const prompt = `
    You have received a CV that has already been optimised for the job description provided. Your task is to evaluate the score of this candidate based on the optimised CV and the job description. The score should be between 0 and 100.

    Follow these steps:

    1. **Assess the Optimised CV**:
    Review the optimised CV that has already been tailored to align with the job description. Compare the candidate's current skills, experience, qualifications, and achievements as they have been adjusted in the optimized CV. Do not revert to the original experience—focus on the optimisations made to emphasize transferable skills, leadership, and relevant experience.

    2. **Evaluate the Chances**:
    Based on the adjustments made to the CV, evaluate whether the candidate is likely to be considered for an interview. Acknowledge the optimizations already made to bridge the gap between the original experience and the job description.

    3. **Provide Feedback Only on Unaddressed Gaps**:
    If there are gaps that cannot be addressed by transferable skills or related experience, provide **specific, actionable feedback** on what is still missing. Focus only on what **cannot be aligned further** from the optimised CV. Avoid suggesting changes that reverse the previous optimizations or transferable skills adjustments. Provide actionable suggestions only if there are clear gaps that remain. Do not write feedback in markdown. Write it as separate plain text items.

    4. **Keep Transferable Skills in Mind**:
    Maintain the adjustments made during optimization that focus on transferable skills, leadership, and problem-solving. Provide feedback on missing or unclear information **without reverting to the original technical roles**. Avoid suggesting unnecessary reversions to the original CV structure.

    5. **Do Not Guess**:
    If there is insufficient information to fill certain sections or gaps, do not guess or fabricate details. Instead, provide feedback on what additional experience, skills, or achievements are required to fully align the CV with the job description.

    6. **Additional Information**:
    The candidate gave additional info as well so that the CV can be tailored to their specific needs.

    Original CV: ${originalCV}
    Optimised CV: ${JSON.stringify(optimisedCV, null, 2)}
    Job Description: ${jobDescription}
    Additional Information: ${additionalInfo}

    Please provide the evaluation result based on the optimised CV.
  `;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content:
            "You are a professional CV evaluator tasked with evaluating an already optimised CV. Your role is to assess whether the optimised CV, which focuses on transferable skills and related experience, aligns with the job description. Do not reverse or undo the optimisations made. Provide actionable feedback only if further alignment is necessary.",
        },
        { role: "user", content: prompt },
      ],
      response_format: zodResponseFormat(
        EvaluationResultSchema,
        "evaluationResult"
      ),
    });

    if (!completion.choices[0].message.parsed) {
      logger.error("No evaluation result returned");
      return {
        data: null,
        error: "No evaluation result returned",
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      };
    }

    const evaluationResult = completion.choices[0].message.parsed;
    const safeParseResult = EvaluationResultSchema.safeParse(evaluationResult);
    const parsedResult = safeParseResult.data;

    if (!parsedResult) {
      logger.error(
        {
          errors: safeParseResult.error,
        },
        "Failed to parse evaluation result:"
      );
      return {
        data: null,
        error: safeParseResult.error,
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      };
    }

    logger.info("Evaluation result returned");

    return {
      data: parsedResult,
      error: null,
      usage: completion.usage ?? {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "evaluateCV");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error({ error }, "Error evaluating CV");
    return {
      data: null,
      error: error,
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    };
  }
}
