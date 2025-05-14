import type { LanguageModelV1 } from "@ai-sdk/provider";
import { generateObject } from "ai";
import { createInsertSchema } from "drizzle-zod";
import type { CompletionUsage } from "openai/resources/completions.mjs";
import { z } from "zod";
import { jobDescriptions } from "~/db/schema";
import { logger } from "~/lib/logger";

const JobDescriptionSchema = createInsertSchema(jobDescriptions);

export const StructuredJobDescriptionSchema = JobDescriptionSchema.extend({
  company: z.string(),
  role: z.string(),
  requiredQualifications: z.array(z.string()),
  requiredExperience: z.array(z.string()),
  requiredSkills: z.array(z.string()),
  preferredQualifications: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  benefits: z.array(z.string()),
  location: z.string(),
  employmentType: z.string(),
  seniority: z.string(),
  industry: z.string(),
  keyTechnologies: z.array(z.string()),
  keywords: z.array(z.string()),
}).omit({
  id: true,
  jobId: true,
  createdAt: true,
  updatedAt: true,
});

export interface ExtractJobDescriptionParams {
  model: LanguageModelV1;
  jobDescriptionText: string;
  userEmail?: string;
}

export async function extractJobDescription({
  model,
  jobDescriptionText,
  userEmail,
}: ExtractJobDescriptionParams): Promise<{
  data: z.infer<typeof StructuredJobDescriptionSchema>;
  usage: CompletionUsage;
}> {
  logger.info("Extracting structured data from job description");
  try {
    const systemPrompt = `
      You are an expert job description parser with specialized knowledge in extracting structured data from job postings.
      Your task is to carefully extract key information from a job description and organize it into a structured format.
      You should extract the information exactly as it appears in the job description without any interpretation or embellishment.
      Pay special attention to keywords and phrases that would be relevant for Applicant Tracking Systems (ATS).
    `;

    const userPrompt = `
      Please extract the following information from this job description and structure it according to the schema:

      1. Basic Information:
         - Company name
         - Role/position title
         - Location
         - Employment type (full-time, part-time, contract, etc.)
         - Seniority level (entry, mid, senior, etc.)
         - Industry

      2. Required Qualifications:
         - Extract all educational requirements and certifications
         - List each as a separate item
         - Pay special attention to specific degree requirements, as these are often ATS screening criteria

      3. Required Experience:
         - Extract all experience requirements
         - List each as a separate item
         - Be precise about years of experience mentioned, as ATS systems often filter by this

      4. Required Skills:
         - Extract all required skills (both technical and soft skills)
         - List each as a separate item
         - Include exact skill names as they appear, as ATS systems match these keywords precisely

      5. Preferred Qualifications:
         - Extract any preferred (but not required) qualifications
         - List each as a separate item

      6. Preferred Skills:
         - Extract any preferred (but not required) skills
         - List each as a separate item

      7. Responsibilities:
         - Extract all job responsibilities and duties
         - List each as a separate item
         - Note responsibilities that indicate required skills not explicitly mentioned elsewhere

      8. Benefits:
         - Extract all mentioned benefits and perks
         - List each as a separate item

      9. Key Technologies:
         - Extract all specific technologies, tools, platforms, or frameworks mentioned
         - List each as a separate item
         - Be precise with version numbers if mentioned (e.g., "Python 3.8" not just "Python")
         - Include exact technology names as they appear, as ATS systems often screen for these

      10. Keywords:
         - Extract all important keywords and phrases that would be relevant for ATS matching
         - Include industry-specific terms, buzzwords, and important concepts mentioned in the job description
         - List each as a separate item
         - This is required and should not be left empty

      Important:
      - Extract the information EXACTLY as it appears in the job description
      - If certain information is not available, provide empty arrays for list fields or empty strings for text fields
      - Be comprehensive - capture all relevant information
      - Do not add any information that is not explicitly stated in the job description
      - Pay special attention to exact terminology used, as ATS systems match keywords precisely
      - Include ALL technical terms, tools, methodologies, and skills mentioned, as these are key for ATS matching
      - For required skills and technologies, use the exact phrasing from the job description to maximize ATS matching

      Job Description Text:
      ${jobDescriptionText}
    `;

    const { object: structuredOutput, usage } = await generateObject({
      model,
      schema: StructuredJobDescriptionSchema,
      schemaName: "jobDescription",
      schemaDescription: "Structured data extracted from the job description",
      system: systemPrompt,
      prompt: userPrompt,
      headers: {
        "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
        ...(userEmail && { "Helicone-User-Id": userEmail }),
      },
    });

    // Validate the output against the schema
    const validatedOutput = StructuredJobDescriptionSchema.parse(structuredOutput);

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
      "Error extracting structured data from job description"
    );
    throw error;
  }
}
