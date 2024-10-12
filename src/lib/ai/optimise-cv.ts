import {
  customSections,
  cvs,
  educations,
  experiences,
  links,
  skills,
} from "@/db/schema";
import { logger } from "@/lib/logger";
import * as Sentry from "@sentry/serverless";
import { createInsertSchema } from "drizzle-zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { CompletionUsage } from "openai/resources/completions.mjs";
import { z } from "zod";
import { openai } from "./openai";

const CVSchema = createInsertSchema(cvs);
const ExperienceSchema = createInsertSchema(experiences);
const EducationSchema = createInsertSchema(educations);
const SkillSchema = createInsertSchema(skills);
const LinkSchema = createInsertSchema(links);
const CustomSectionSchema = createInsertSchema(customSections);

const ExtendedCVSchema = CVSchema.extend({
  experiences: z.array(ExperienceSchema.omit({ id: true, cvId: true })),
  educations: z.array(EducationSchema.omit({ id: true, cvId: true })),
  skills: z.array(SkillSchema.omit({ id: true, cvId: true })),
  links: z.array(LinkSchema.omit({ id: true, cvId: true })),
  customSections: z.array(CustomSectionSchema.omit({ id: true, cvId: true })),
  company: z.string().optional(),
  role: z.string().optional(),
}).omit({ id: true, optimizationId: true, createdAt: true, updatedAt: true });

export const OptimisedCVSchema = ExtendedCVSchema.extend({
  name: z.string(),
  title: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  summary: z.string(),
  isPublic: z.boolean().optional(),
  experiences: z.array(
    ExperienceSchema.omit({ id: true, cvId: true }).extend({
      title: z.string(),
      company: z.string(),
      location: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      description: z.string(),
    })
  ),
  educations: z.array(
    EducationSchema.omit({ id: true, cvId: true }).extend({
      degree: z.string(),
      school: z.string(),
      location: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
    })
  ),
  skills: z.array(
    SkillSchema.omit({ id: true, cvId: true }).extend({
      skill: z.string(),
    })
  ),
  links: z.array(
    LinkSchema.omit({ id: true, cvId: true }).extend({
      name: z.string(),
      url: z.string(),
    })
  ),
  customSections: z.array(
    CustomSectionSchema.omit({ id: true, cvId: true }).extend({
      title: z.string(),
      content: z.string(),
    })
  ),
  company: z.string().optional(),
  role: z.string().optional(),
});

export async function optimiseCV(
  submittedCVText: string,
  jobDescriptionText: string,
  additionalInfo: string,
  customisations: string
): Promise<{
  data: z.infer<typeof ExtendedCVSchema> | null;
  error: unknown | null;
  usage: CompletionUsage;
}> {
  logger.info("Optimising CV");
  try {
    const prompt = `
    I need you to optimise a CV to a very high standard for a specific job description. The goal is to tailor the CV perfectly to the job role and ensure it passes Applicant Tracking Systems (ATS). The result should be a well-structured CV that highlights the candidate's relevant skills and experience, aligns with the job requirements, and is designed to impress recruiters and increase the chances of landing an interview.

    Follow these instructions carefully:

    1. **Analyze the Job Description**:
    Carefully read and analyze the job description provided.
    Identify key skills, requirements, and qualifications mentioned in the job description, particularly those that are listed as "required" or "essential."
    Look for specific keywords that are likely to be used by ATS systems (e.g., technical skills, certifications, job-specific terminology).

    2. **Tailor the CV to the Job**:
    Match the candidate's **experience, skills, and achievements** to the job description. If the candidate’s current job roles and experience are not directly related (e.g., they are applying for a legal role but have experience in software development), do the following:
    - Focus on **transferable skills** such as leadership, problem-solving, project management, and collaboration that apply across industries.
    - Adjust the **context** of job roles to make them more applicable to the target job. For example, if the role involves leadership, highlight leadership experience from previous technical roles and focus on cross-functional team collaboration.
    - If there are sections of the CV that are relevant to the job but don't fit well into the other sections, then create custom sections for them.
    - Where appropriate, adjust **job titles** to reflect more relevant roles for the target position (e.g., changing “Senior Front-End Developer” to “Project Lead” or “Technical Consultant” to better fit a legal or management role). But do this within reason. Don't change the title to something that is completely unrelated or unrealistic or that could be seen as unprofessional or misleading. Please be very conservative with this and retain the original title if it is already a good fit. Or retain the meaning of the title. But if you want to point to something else then say the original with a / and then the title that's more role relevant. But again be very conservative.
    - Adjust the **summary** to focus on the skills and experiences that align with the new job, rather than focusing on past job titles or roles that don’t match the new field.
    - Adjust the **skills** to focus on the skills that are most relevant to the new job.
    - Adjust the byline of the CV to make it more relevant to the new job. For example, if the candidate is applying for a legal role, the byline should be "Aspiring Solicitor" rather than "Software Developer".
    - Do not include skills that are not relevant to the new job.

    3. **Respect Customizations**:
    The following are the **customizations** set by the user that must be respected and applied during the optimization process:
    "${customisations}"

    4. **Date Formatting**:
    Ensure that all dates in the CV are formatted as **ISO strings** (e.g., "YYYY-MM-DD"). If only the month and year are provided, set the day to the first of the month (e.g., "YYYY-MM-01"). If only the year is provided, set the month and day to the first of the year (e.g., "YYYY-01-01"). This ensures all dates can be easily converted into a standard format. Except where it's the current role then you should leave the end date as an empty string.

    5. **Transferable Skills and Related Experience**:
    Where possible, adjust descriptions of current experience to make them more **relevant** to the new field (e.g., emphasizing leadership, client relations, regulatory compliance, or communication for a legal role). You may need to emphasize aspects of the candidate’s existing job history that demonstrate skills applicable to the new role.

    6. **Highlight Achievements and Impact**:
    Focus on **quantifiable achievements** and measurable impact in each role, especially if these achievements demonstrate **transferable skills** or how the candidate’s previous experience can benefit the target role.

    7. **ATS Optimization**:
    Ensure that the CV includes **industry-specific keywords** from the job description and aligns with the language used by ATS systems.

    8. **Final Review**:
    Ensure the CV highlights key achievements, is keyword-optimized for ATS, and stands out to human recruiters in the target field.

    9. **Use Markdown for Long Text Fields**:
    Use markdown formatting for longer text fields such as summaries, job descriptions, and custom sections.

    10. **Company and Role Extraction**:
    Extract the company name and role from the job description.

    11. **Additional Information**:
    Use the additional information to tailor the CV to the candidate's specific needs.

    Candidate's CV: ${submittedCVText}
    Job Description: ${jobDescriptionText}
    additional information: ${additionalInfo}

    Please provide the optimised CV in the structured format specified, using markdown for long text fields.
  `;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content:
            "You are an expert CV optimiser with specialized knowledge in tailoring resumes for specific job descriptions and industries. Your task is to take a candidate's existing CV and optimise it to a very high standard based on the provided job description. If the candidate’s experience or skills do not align perfectly with the job description, adjust the context, role titles, and focus to emphasize transferable skills, leadership, or relevant experience. Always do your best to align the CV to the job description even if the candidate's direct experience differs. Ensure all dates are formatted as ISO strings (YYYY-MM-DD). If only the year or month is provided, default to the first day or first month. Do not fabricate or guess any details.",
        },
        { role: "user", content: prompt },
      ],
      response_format: zodResponseFormat(OptimisedCVSchema, "optimisedCV"),
    });

    if (!completion.choices[0].message.parsed) {
      logger.error("No optimised CV returned");
      return {
        data: null,
        error: "No optimised CV returned",
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      };
    }

    const optimisedCV = completion.choices[0].message.parsed;
    const safeParseResult = ExtendedCVSchema.safeParse(optimisedCV);
    const parsedCV = safeParseResult.data;

    if (!parsedCV) {
      logger.error(
        {
          errors: safeParseResult.error,
        },
        "Failed to parse optimised CV:"
      );
      return {
        data: null,
        error: safeParseResult.error,
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      };
    }

    logger.info("Optimised CV returned");

    return {
      data: parsedCV,
      error: null,
      usage: completion.usage ?? {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "optimiseCV");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error optimizing CV"
    );
    return {
      data: null,
      error: error,
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    };
  }
}
