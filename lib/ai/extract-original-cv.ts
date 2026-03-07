import type { LanguageModel } from "ai";
import { generateObject } from "ai";
import type { CompletionUsage } from "openai/resources/completions.mjs";
import { z } from "zod";
import { logger } from "~/lib/logger";

const experienceSchema = z.object({
  title: z.string().describe("Job title. Return empty string if not found."),
  company: z.string().describe("Company name. Return empty string if not found."),
  location: z.string().describe("Job location. Return empty string if not found."),
  startDate: z
    .string()
    .describe("Start date in the format provided in the CV. Return empty string if not found."),
  endDate: z
    .string()
    .nullable()
    .describe("End date in the format provided in the CV, or null if current position."),
  description: z.string().describe("Job description. Return empty string if not found."),
  current: z
    .boolean()
    .describe(
      "Whether this is a current position. Return false if not explicitly indicated as current."
    ),
});

const ExtendedOriginalCVSchema = z.object({
  experiences: z
    .array(experienceSchema)
    .describe("Array of work experiences. Return empty array if none found."),
  skills: z
    .array(
      z.object({
        skill: z.string().describe("Individual skill. Return empty string if not found."),
      })
    )
    .describe("List of skills mentioned in the CV. Return empty array if none found."),
  links: z
    .array(
      z.object({
        name: z
          .string()
          .describe(
            "Name of the link (e.g., 'LinkedIn', 'Portfolio'). Return empty string if not found."
          ),
        url: z.string().describe("URL of the link. Return empty string if not found."),
      })
    )
    .describe("Professional links extracted from the CV. Return empty array if none found."),
  customSections: z
    .array(
      z.object({
        title: z
          .string()
          .describe("Title of the custom section. Return empty string if not found."),
        content: z
          .string()
          .describe("Content of the custom section. Return empty string if not found."),
      })
    )
    .describe(
      "Other sections from the CV like certifications, languages, interests, etc. Return empty array if none found."
    ),
});

export const StructuredOriginalCVSchema = ExtendedOriginalCVSchema.extend({
  name: z.string().describe("Candidate's full name. Return empty string if not found."),
  title: z.string().describe("Professional title/role. Return empty string if not found."),
  email: z.string().describe("Email address. Return empty string if not found."),
  phone: z.string().describe("Phone number. Return empty string if not found."),
  location: z.string().describe("Location (city/country). Return empty string if not found."),
  summary: z
    .string()
    .describe("Professional summary or profile section. Return empty string if not found."),
  experiences: z
    .array(experienceSchema)
    .describe("Array of work experiences. Return empty array if none found."),
  educations: z
    .array(
      z.object({
        degree: z.string().describe("Degree or qualification. Return empty string if not found."),
        school: z.string().describe("School or university name. Return empty string if not found."),
        location: z.string().describe("School location. Return empty string if not found."),
        startDate: z
          .string()
          .describe("Start date of education. Return empty string if not found."),
        endDate: z.string().nullable().describe("End date of education, or null if current."),
      })
    )
    .describe("Educational background. Return empty array if none found."),
  skills: z
    .array(
      z.object({
        skill: z.string().describe("Individual skill. Return empty string if not found."),
      })
    )
    .describe("List of skills mentioned in the CV. Return empty array if none found."),
  links: z
    .array(
      z.object({
        name: z
          .string()
          .describe(
            "Name of the link (e.g., 'LinkedIn', 'Portfolio'). Return empty string if not found."
          ),
        url: z.string().describe("URL of the link. Return empty string if not found."),
      })
    )
    .describe("Professional links extracted from the CV. Return empty array if none found."),
  customSections: z
    .array(
      z.object({
        title: z
          .string()
          .describe("Title of the custom section. Return empty string if not found."),
        content: z
          .string()
          .describe("Content of the custom section. Return empty string if not found."),
      })
    )
    .describe(
      "Other sections from the CV like certifications, languages, interests, etc. Return empty array if none found."
    ),
});

export interface ExtractOriginalCVParams {
  model: LanguageModel;
  submittedCVText: string;
  userEmail?: string;
}

export async function extractOriginalCV({
  model,
  submittedCVText,
  userEmail,
}: ExtractOriginalCVParams): Promise<{
  data: z.infer<typeof StructuredOriginalCVSchema>;
  usage: CompletionUsage;
}> {
  logger.info("Extracting structured data from original CV");
  try {
    const systemPrompt = `
      You are an expert CV parser with specialized knowledge in extracting structured data from resumes.
      Your task is to carefully extract key information from a CV and organize it into a structured format.
      You should extract the information exactly as it appears in the CV without any optimization or improvements.
    `;

    const userPrompt = `
      Please extract the following information from this CV and structure it according to the schema:

      1. Basic Information:
         - Full name
         - Professional title
         - Email address
         - Phone number
         - Location

      2. Professional Summary:
         - Extract the summary or profile section exactly as written

      3. Work Experience:
         For each position, extract:
         - Job title
         - Company name
         - Location
         - Start date (in the format provided in the CV)
         - End date (in the format provided in the CV, or use null if current)
         - Job description (preserve bullet points and formatting as much as possible)
         - Current (true if the position is currently held, false otherwise). If the end date is not provided, use true.

      4. Education:
         For each entry, extract:
         - Degree/qualification
         - School/university name
         - Location
         - Start date
         - End date (or use null if current)

      5. Skills:
         - List all skills mentioned in the CV

      6. Links:
         - Extract any professional links (LinkedIn, portfolio, GitHub, etc.)

      7. Custom Sections:
         - For any other sections (certifications, languages, interests, etc.), extract the title and content

      Important:
      - Extract the information EXACTLY as it appears in the CV without any improvements or modifications
      - Preserve the original wording, formatting, and structure as much as possible
      - Do not add any information that is not explicitly stated in the CV
      - For any field where information is not found, return empty string for text fields, empty array for array fields, or false for boolean fields
      - For current positions or education without an end date, use null for the end date

      CV Text:
      ${submittedCVText}

    `;

    const { object: structuredOutput, usage } = await generateObject({
      model,
      schema: StructuredOriginalCVSchema,
      schemaName: "originalCV",
      schemaDescription: "Structured data extracted from the original CV",
      system: systemPrompt,
      temperature: 1,
      prompt: userPrompt,
      headers: {
        "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
        ...(userEmail && { "Helicone-User-Id": userEmail }),
      },
    });

    // Validate the output against the schema
    const validatedOutput = StructuredOriginalCVSchema.parse(structuredOutput);

    return {
      data: validatedOutput,
      usage: {
        prompt_tokens: usage.inputTokens ?? 0,
        completion_tokens: usage.outputTokens ?? 0,
        total_tokens: (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
      },
    };
  } catch (error) {
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error extracting structured data from original CV"
    );
    throw error;
  }
}
