import type { LanguageModelV1 } from "@ai-sdk/provider";
import { generateObject } from "ai";
import type { CompletionUsage } from "openai/resources/completions.mjs";
import { z } from "zod";
import { logger } from "~/lib/logger";

const experienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  description: z.string(),
  current: z.boolean(),
});

const ExtendedOriginalCVSchema = z.object({
  experiences: z.array(experienceSchema),
  skills: z.array(
    z.object({
      skill: z.string(),
    })
  ),
  links: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
    })
  ),
  customSections: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
    })
  ),
});

export const StructuredOriginalCVSchema = ExtendedOriginalCVSchema.extend({
  name: z.string(),
  title: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  summary: z.string(),
  experiences: z.array(experienceSchema),
  educations: z.array(
    z.object({
      degree: z.string(),
      school: z.string(),
      location: z.string(),
      startDate: z.string(),
      endDate: z.string().nullable(),
    })
  ),
  skills: z.array(
    z.object({
      skill: z.string(),
    })
  ),
  links: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
    })
  ),
  customSections: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
    })
  ),
});

export interface ExtractOriginalCVParams {
  model: LanguageModelV1;
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
      - If certain information is not available, use reasonable defaults based on the candidate details provided
      - For current positions or education without an end date, use null instead of omitting the field

      CV Text:
      ${submittedCVText}

    `;

    const { object: structuredOutput, usage } = await generateObject({
      model,
      schema: StructuredOriginalCVSchema,
      schemaName: "originalCV",
      schemaDescription: "Structured data extracted from the original CV",
      system: systemPrompt,
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
        prompt_tokens: usage.promptTokens,
        completion_tokens: usage.completionTokens,
        total_tokens: usage.promptTokens + usage.completionTokens,
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
