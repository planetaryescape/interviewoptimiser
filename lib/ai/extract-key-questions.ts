import type { LanguageModelV1 } from "@ai-sdk/provider";
import { generateObject } from "ai";
import type { CompletionUsage } from "openai/resources/completions.mjs";
import { z } from "zod";
import type { InterviewTypeDefinition } from "@/fixtures/interview-types";
import { interviewTypes } from "@/fixtures/interview-types";
import type { JobDescription } from "~/db/schema";
import { logger } from "~/lib/logger";

const KeyQuestionsSchema = z.object({
  keyQuestions: z
    .array(z.string().describe("Individual key interview question for the specific role"))
    .describe(
      "Array of key questions that must be asked to every candidate applying for this role. Should return empty array if no questions can be generated."
    ),
});

export interface ExtractKeyQuestionsParams {
  model: LanguageModelV1;
  jobDescriptionData: JobDescription;
  interviewType: string;
  userEmail?: string;
  duration?: number;
}

export async function extractKeyQuestions({
  model,
  jobDescriptionData,
  interviewType,
  userEmail,
  duration,
}: ExtractKeyQuestionsParams): Promise<{
  data: z.infer<typeof KeyQuestionsSchema>;
  usage: CompletionUsage;
}> {
  logger.info("Extracting key questions from job description");
  try {
    const interviewTypeInfo =
      interviewTypes.find((type: InterviewTypeDefinition) => type.type === interviewType) ||
      interviewTypes[0];

    const systemPrompt = `
      You are an expert interviewer and job analyst with deep experience in creating highly effective interview questions.
      Your task is to analyze a job description and create the most important questions that must be asked to every candidate.
      These questions should be specifically tailored to assess the candidate's suitability for this exact role.
      The questions should help determine if the candidate has the required skills, experience, and qualities needed for success in this role.
      ${
        duration
          ? `CRUCIALLY, you MUST consider that the interview has a total duration of ${duration} minutes. The key questions, in their entirety including the number of questions and the expected answer length and potential follow-ups, should realistically fit within this timeframe.`
          : ""
      }

      You are conducting a ${interviewType} which ${interviewTypeInfo.description}
      Here are example questions for this type of interview:
      ${interviewTypeInfo.exampleQuestions.map((q: string) => `- ${q}`).join("\n")}
    `;

    const userPrompt = `
      Based on the provided job description data, generate exactly 5 key questions that must be asked to every candidate applying for this role.
      The questions should follow the ${interviewType} style while being specifically tailored to this role.
      ${
        duration
          ? `
      IMPORTANT DURATION CONSIDERATION: The interview is scheduled for ${duration} minutes. This is a CRITICAL constraint.
      The questions you generate must be collectively answerable, including typical follow-up probing, within this ${duration}-minute timeframe.
      This means you need to carefully calibrate the complexity and expected depth of each question.
      For shorter durations, questions might need to be more direct. For longer durations, there's room for more expansive answers or slightly more nuanced questions.
      The goal is a comprehensive assessment within the given time, so ensure the questions are concise enough if the duration is short, and allow for depth if the duration is longer, without making any single question overly burdensome.
      Aim for a balanced set of questions that effectively uses the allocated ${duration} minutes.
      `
          : ""
      }

      These questions should:
      1. Be highly specific to this role, company, and industry
      2. Help assess the candidate's ability to meet the core requirements
      3. Cover both technical capabilities and practical experience
      4. Be designed to reveal the candidate's depth of knowledge and expertise
      5. Help predict the candidate's potential success in this specific role

      Important Guidelines:
      - Each question should be clear, specific, and directly related to key aspects of the role
      - Questions should follow the ${interviewType} format: ${interviewTypeInfo.description}
      - Questions should not be generic interview questions that could apply to any job
      - Focus on questions that will reveal the candidate's real capabilities, not just theoretical knowledge
      - Include questions that address the most critical required skills and experiences
      - Questions should help assess both technical competency and practical application
      - Questions should be appropriate for the seniority level of the role
      - Questions should match the style of the interview type while being specific to the role

      For example, if this is a behavioral interview and the role requires leadership skills, ask about specific past leadership experiences.
      If this is a technical interview and the role requires specific technical skills, ask about practical application of those skills.

      Job Description Data:
      ${JSON.stringify(jobDescriptionData, null, 2)}
    `;

    const { object: questionsOutput, usage } = await generateObject({
      model,
      schema: KeyQuestionsSchema,
      schemaName: "keyQuestions",
      schemaDescription:
        "Array of key questions that must be asked to every candidate applying for this role",
      system: systemPrompt,
      temperature: 1,
      prompt: userPrompt,
      headers: {
        "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
        ...(userEmail && { "Helicone-User-Id": userEmail }),
      },
    });

    // Validate the output against the schema
    const validatedOutput = KeyQuestionsSchema.parse(questionsOutput);

    return {
      data: validatedOutput,
      usage: {
        prompt_tokens: usage.promptTokens,
        completion_tokens: usage.completionTokens,
        total_tokens: usage.promptTokens + usage.completionTokens,
      },
    };
  } catch (error) {
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error extracting key questions from job description"
    );
    throw error;
  }
}
