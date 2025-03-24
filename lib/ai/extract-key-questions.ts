import type { InterviewType } from "@/utils/conversation_config";
import { interviewTypes } from "@/utils/conversation_config";
import type { LanguageModelV1 } from "@ai-sdk/provider";
import { generateObject } from "ai";
import type { CompletionUsage } from "openai/resources/completions.mjs";
import { z } from "zod";
import { logger } from "~/lib/logger";

const KeyQuestionsSchema = z.object({
  keyQuestions: z.array(z.string()),
});

export interface ExtractKeyQuestionsParams {
  model: LanguageModelV1;
  jobDescriptionData: {
    company: string;
    role: string;
    requiredQualifications: string[];
    requiredExperience: string[];
    requiredSkills: string[];
    preferredQualifications: string[];
    preferredSkills: string[];
    responsibilities: string[];
    keyTechnologies: string[];
    seniority: string;
    industry: string;
  };
  interviewType: string;
  userEmail?: string;
}

export async function extractKeyQuestions({
  model,
  jobDescriptionData,
  interviewType,
  userEmail,
}: ExtractKeyQuestionsParams): Promise<{
  data: z.infer<typeof KeyQuestionsSchema>;
  usage: CompletionUsage;
}> {
  logger.info("Extracting key questions from job description");
  try {
    const interviewTypeInfo =
      interviewTypes.find((type: InterviewType) => type.type === interviewType) ||
      interviewTypes[0];

    const systemPrompt = `
      You are an expert interviewer and job analyst with deep experience in creating highly effective interview questions.
      Your task is to analyze a job description and create the 5 most important questions that must be asked to every candidate.
      These questions should be specifically tailored to assess the candidate's suitability for this exact role.
      The questions should help determine if the candidate has the required skills, experience, and qualities needed for success in this role.

      You are conducting a ${interviewType} which ${interviewTypeInfo.description}
      Here are example questions for this type of interview:
      ${interviewTypeInfo.exampleQuestions.map((q: string) => `- ${q}`).join("\n")}
    `;

    const userPrompt = `
      Based on the provided job description data, generate exactly 5 key questions that must be asked to every candidate applying for this role.
      The questions should follow the ${interviewType} style while being specifically tailored to this role.

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
      schemaDescription: "Array of 5 key questions that must be asked to every candidate",
      system: systemPrompt,
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
