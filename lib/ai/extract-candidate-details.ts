import type { LanguageModel } from "ai";
import { generateObject } from "ai";
import type { CompletionUsage } from "openai/resources/completions.mjs";
import { z } from "zod";
import { logger } from "~/lib/logger";

// Schema for candidate details extraction
const CandidateDetailsSchema = z.object({
  name: z.string().describe("Candidate's full name. Return empty string if not found."),
  email: z.string().describe("Candidate's email address. Return empty string if not found."),
  phone: z.string().describe("Candidate's phone number. Return empty string if not found."),
  location: z
    .string()
    .describe("Candidate's location (city/country). Return empty string if not found."),
  currentRole: z
    .string()
    .describe("Candidate's current or most recent job title. Return empty string if not found."),
  professionalSummary: z
    .string()
    .describe(
      "Brief summary of candidate's professional profile or career objectives. Return empty string if not found."
    ),
  linkedinUrl: z
    .string()
    .describe("Candidate's LinkedIn profile URL. Return empty string if not found."),
  portfolioUrl: z
    .string()
    .describe("Candidate's portfolio or personal website URL. Return empty string if not found."),
  otherUrls: z
    .array(z.string().describe("Additional professional URLs"))
    .describe("Array of other professional online profiles. Return empty array if none found."),
});

export type CandidateDetails = z.infer<typeof CandidateDetailsSchema>;

export interface ExtractCandidateDetailsParams {
  model: LanguageModel;
  submittedCVText: string;
  userEmail?: string;
}

/**
 * Extracts candidate details from a CV
 * @param params - Object containing all parameters for the extraction
 * @returns Structured candidate details extracted from the CV
 */
export async function extractCandidateDetails({
  model,
  submittedCVText,
  userEmail,
}: ExtractCandidateDetailsParams): Promise<{
  data: CandidateDetails;
  usage: CompletionUsage;
}> {
  logger.info("Extracting candidate details from CV");
  try {
    const systemPrompt =
      "You are an expert CV parser with specialized knowledge in extracting personal and professional details from resumes. Your task is to carefully extract key information from a CV including personal details, contact information, and current role.";

    const userPrompt = `
      Please extract the following information from this CV:

      1. Full Name: Extract the candidate's full name as it appears on the CV.

      2. Contact Information:
         - Email address
         - Phone number
         - Current location/address (city and country are sufficient)

      3. Current Role:
         - Extract the current or most recent job title
         - If unemployed or student, indicate their most recent role or status

      4. Professional Summary:
         - Extract a brief summary of their professional profile, career objectives, or personal statement
         - This should be a concise representation of how they describe themselves professionally

      5. Online Presence:
         - LinkedIn URL (if not found, return empty string)
         - Portfolio/personal website URL (if not found, return empty string)
         - Other professional online profiles (provide as an array, return empty array if none found)

      Do not fabricate or guess information that isn't clearly stated in the CV. For any field where information is not found, return an empty string for text fields or empty array for array fields.

      CV Text: ${submittedCVText}

      Please extract only the information requested above in the structured format specified.
    `;

    // Direct call to generateObject with the model
    const { object: structuredOutput, usage } = await generateObject({
      model,
      schema: CandidateDetailsSchema,
      schemaName: "candidateDetails",
      schemaDescription: "Personal and professional details extracted from a CV",
      system: systemPrompt,
      temperature: 1,
      prompt: userPrompt,
      headers: {
        "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
        ...(userEmail && { "Helicone-User-Id": userEmail }),
      },
    });

    // Validate the output against the schema - use parse instead of safeParse to throw errors
    const validatedOutput = CandidateDetailsSchema.parse(structuredOutput);

    return {
      data: validatedOutput,
      usage: {
        prompt_tokens: usage.promptTokens ?? 0,
        completion_tokens: usage.completionTokens ?? 0,
        total_tokens: (usage.promptTokens ?? 0) + (usage.completionTokens ?? 0),
      },
    };
  } catch (error) {
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error extracting candidate details from CV"
    );
    throw error;
  }
}
