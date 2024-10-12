import { coverLetters } from "@/db/schema";
import { logger } from "@/lib/logger";
import * as Sentry from "@sentry/serverless";
import { createInsertSchema } from "drizzle-zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { openai } from "./openai";
import { OptimisedCVSchema } from "./optimise-cv";

// Get today's date in the desired format
const today = new Date().toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const CoverLetterSchema = createInsertSchema(coverLetters);

const ExtendedCoverLetterSchema = CoverLetterSchema.extend({
  content: z.string(),
}).omit({ id: true, optimizationId: true, createdAt: true, updatedAt: true });

export async function generateCoverLetter(
  optimisedCV: z.infer<typeof OptimisedCVSchema>,
  jobDescription: string,
  additionalInfo: string
): Promise<{
  data: z.infer<typeof ExtendedCoverLetterSchema> | null;
  error: unknown | null;
}> {
  try {
    const prompt = `
    I need you to write a professional cover letter in markdown format based on the following CV and job description. The cover letter should emphasize the candidate's most relevant experience and skills, particularly the transferable skills that align with the job description.

    Please include the following elements in the cover letter:

    1. **Date**:
    - Use today's date: **${today}**.

    2. **Company Details**:
    - Extract the company name and any other relevant company details from the job description (e.g., the company’s name, address, and the role being applied for).
    - If the job description does not contain clear company details, leave this out or use placeholders.

    3. **Introduction**:
    - Briefly introduce the candidate and mention the job they are applying for.
    - Express enthusiasm for the opportunity and explain why they are interested in the role.

    4. **Body**:
    - Highlight the candidate's most relevant skills and experience.
    - Focus on transferable skills or previous experiences that align with the requirements of the job.
    - Explain how the candidate's background makes them an excellent fit for the role.

    5. **Closing**:
    - Reiterate interest in the position and confidence in being a great fit.
    - Mention availability for an interview and provide contact information.

    6. **Fit within A4 Page**:
    - Try as much as possible to make the letter fit within a standard A4 page size (approximately 250–300 words). However, this is a flexible recommendation and can be adjusted if necessary.

    7. **Additional Information**:
    - Use the additional information to tailor the cover letter to the candidate's specific needs.

    Ensure the tone is professional yet personable. The cover letter should flow naturally, avoiding repetitive or overly formal language.

    Candidate's CV:
    ${JSON.stringify(optimisedCV, null, 2)}

    Job Description:
    ${jobDescription}

    Additional Information:
    ${additionalInfo}

    Please provide the cover letter in markdown format.
  `;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content:
            "You are an expert in writing professional cover letters based on CVs and job descriptions. Your task is to generate a cover letter that highlights the candidate's transferable skills and relevant experience, aligning the letter with the job description provided. Use markdown for the cover letter output, and ensure it attempts to fit within an A4 page size.",
        },
        { role: "user", content: prompt },
      ],
      response_format: zodResponseFormat(
        ExtendedCoverLetterSchema,
        "coverLetter"
      ),
    });

    const coverLetterResult = completion.choices[0].message.parsed;
    const safeParseResult =
      ExtendedCoverLetterSchema.safeParse(coverLetterResult);
    const parsedCoverLetter = safeParseResult.data;

    if (!parsedCoverLetter) {
      logger.error(
        {
          errors: safeParseResult.error,
        },
        "Failed to parse generated cover letter:"
      );
      return {
        data: null,
        error: safeParseResult.error,
      };
    }

    return {
      data: parsedCoverLetter,
      error: null,
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "generateCoverLetter");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error generating cover letter"
    );
    return {
      data: null,
      error: error,
    };
  }
}
