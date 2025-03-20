import * as Sentry from "@sentry/serverless";
import { generateObject } from "ai";
import { createInsertSchema } from "drizzle-zod";
import * as R from "remeda";
import { z } from "zod";
import { reports } from "~/db/schema";
import type { Interview as InterviewSchema } from "~/db/schema/interviews";
import type { CandidateDetails } from "~/lib/ai/extract-candidate-details";
import type { StructuredJobDescriptionSchema } from "~/lib/ai/extract-job-description";
import type { StructuredOriginalCVSchema } from "~/lib/ai/extract-original-cv";
import { logger } from "~/lib/logger";
import { getOpenAiClient } from "../openai";

const ReportSchema = createInsertSchema(reports);

const ExtendedReportSchema = ReportSchema.extend({
  generalAssessment: z.string().describe("Overall assessment of the interview performance"),
  overallScore: z.number().describe("Overall score of the interview out of 100"),
  fitnessForRole: z.string().describe("Assessment of the candidate's fitness for the role"),
  fitnessForRoleScore: z.number().describe("Score for fitness for the role out of 100"),
  speakingSkills: z.string().describe("Assessment of the candidate's speaking skills"),
  speakingSkillsScore: z.number().describe("Score for speaking skills out of 100"),
  communicationSkills: z.string().describe("Assessment of the candidate's communication skills"),
  communicationSkillsScore: z.number().describe("Score for communication skills out of 100"),
  problemSolvingSkills: z.string().describe("Assessment of the candidate's problem-solving skills"),
  problemSolvingSkillsScore: z.number().describe("Score for problem-solving skills out of 100"),
  technicalKnowledge: z.string().describe("Assessment of the candidate's technical knowledge"),
  technicalKnowledgeScore: z.number().describe("Score for technical knowledge out of 100"),
  teamwork: z.string().describe("Assessment of the candidate's teamwork abilities"),
  teamworkScore: z.number().describe("Score for teamwork abilities out of 100"),
  adaptability: z.string().describe("Assessment of the candidate's adaptability"),
  adaptabilityScore: z.number().describe("Score for adaptability out of 100"),
  areasOfStrength: z.array(z.string()).describe("List of the candidate's areas of strength"),
  areasForImprovement: z
    .array(z.string())
    .describe("List of areas where the candidate can improve"),
  actionableNextSteps: z
    .array(z.string())
    .describe("List of actionable steps for the candidate to improve"),
  candidateName: z.string().describe("Name of the candidate"),
  companyName: z.string().describe("Name of the company being applied to"),
  roleName: z.string().describe("Name of the role being applied for"),
}).omit({ id: true, interviewId: true, createdAt: true, updatedAt: true });

const SYSTEM_PROMPT = `
  You are an expert interview analyst and career coach. Your task is to provide very detailed, comprehensive, candid, and constructive feedback on interview performances. Aim to be honest, direct, and constructively critical. Follow the principles of Radical Candor: "Care Personally, Challenge Directly." Do not be afraid to call out a bad performance as long as you can back it up with specific reasons or examples from the interview. Deliver clear, respectful feedback aimed at empowering the candidate to improve. Use specific examples from the interview to support your points. If the interview information is limited, provide the most useful and actionable report possible with the available data, **and recommend a longer mock interview for more comprehensive feedback.** Stick to the information provided in the transcript. Provide scores out of 100 for each section and an overall score to help the candidate understand their performance.
`;

const USER_PROMPT = `
  Analyze the following interview transcript and generate a very detailed, comprehensive, well-formatted report in Markdown (with hierarchical headings, bold, italic, etc.) on the candidate's performance. **Word count is not a factor.** Focus your analysis on both the content of the interview transcript and the prosody analysis provided for each message.

  Important: The CV, job description, and additional information are provided only for context. Do not use them as the basis for your analysis or report. Focus solely on the interview transcript and prosody analysis for your evaluation.

  Each message in the transcript contains prosody analysis, indicating the user's tone. Carefully analyze the emotional expressions provided for each message. The score indicates how likely the user is expressing that emotion in their voice. Consider these expressions and confidence scores to craft an empathic, appropriate assessment. Even if the user does not explicitly state their emotions, infer the emotional context from these expressions.

  Before starting the report, extract the following information:
  1. The candidate's name
  2. The name of the company being applied to
  3. The name of the role being applied for

  Then, proceed with the report structure as follows:

  1. General Assessment
    • Overall evaluation of the candidate's performance
    • Comments on confidence, clarity, engagement, and professionalism
    • Specific examples highlighting strengths and areas for improvement
    • Balanced tone acknowledging both positives and negatives
    • Analysis of the candidate's emotional state throughout the interview based on prosody data

  2. Detailed Feedback
    • Candidate's fitness for the role based on their experiences and responses. Including strengths and areas for improvement. This is very important for the report!!
    • Speaking skills assessment (fluency, clarity, confidence, hesitation, filler words)
    • Clarity, relevance, and depth of responses
    • Communication skills evaluation (elaboration, specific examples)
    • Problem-solving skills, technical knowledge, teamwork, adaptability, and overall fit
    • Emotional intelligence and ability to manage stress during the interview (based on prosody analysis)
    • Areas of Strength (3-5 points with specific examples)
    • Areas for Improvement (2-3 points with specific examples and actionable tips)

  3. Actionable Next Steps
    • Strengths to build on (with suggestions for leveraging in future interviews)
    • Focus areas for improvement (with practical steps)
    • Suggestions for managing emotions and stress during interviews
    • Encouraging closing note on continuous improvement

  Provide a score out of 100 for each major section, including a separate score for emotional management based on the prosody analysis. Conclude with an overall performance score.

  Interview Transcript:
  {{TRANSCRIPT}}

  Additional Context (for reference only, not for analysis):
  Submitted CV: {{CV}}
  Job Description: {{JD}}
  Additional Information: {{ADDITIONAL_INFO}}

  Maintain a candid yet respectful tone throughout the report, adhering to Radical Candor principles. Base your analysis and feedback on both the interview transcript content and the prosody analysis provided for each message. Do not be afraid to call out a bad performance as long as you can back it up with specific reasons or examples from the interview.
`;

/**
 * Generates a detailed analysis report for an interview
 * @param interview The interview object containing basic information
 * @param transcriptString The transcript of the interview in JSON string format
 * @param userEmail Optional user email for tracking purposes
 * @param structuredCV Optional structured CV data extracted from the submitted CV
 * @param structuredJobDescription Optional structured job description data
 * @param structuredCandidateDetails Optional structured candidate details
 * @returns A structured report with scores and analysis
 */
export async function analyseInterview(
  interview: InterviewSchema,
  transcriptString: string,
  userEmail?: string,
  structuredCV?: z.infer<typeof StructuredOriginalCVSchema>,
  structuredJobDescription?: z.infer<typeof StructuredJobDescriptionSchema>,
  structuredCandidateDetails?: CandidateDetails
) {
  try {
    if (!transcriptString) {
      throw new Error("No transcript found");
    }

    const transcript = JSON.parse(transcriptString).map(
      (message: {
        role: "user" | "assistant";
        content: string;
        prosody: Record<string, number>;
      }) => ({
        ...message,
        prosody: R.pipe(
          message.prosody,
          R.entries(),
          R.sortBy(R.pathOr([1], 0)),
          R.reverse(),
          R.take(5)
        ),
      })
    );

    // Create an enhanced prompt that includes the structured data
    let enhancedUserPrompt = USER_PROMPT.replace("{{TRANSCRIPT}}", JSON.stringify(transcript))
      .replace("{{CV}}", interview.submittedCVText)
      .replace("{{JD}}", interview.jobDescriptionText)
      .replace("{{ADDITIONAL_INFO}}", interview.additionalInfo ?? "");

    // Add structured data to the prompt if available
    if (structuredCV || structuredJobDescription || structuredCandidateDetails) {
      enhancedUserPrompt += "\n\n## STRUCTURED DATA\n";

      if (structuredCV) {
        enhancedUserPrompt += `\n### STRUCTURED CV DATA\n${JSON.stringify(
          structuredCV,
          null,
          2
        )}\n`;
      }

      if (structuredJobDescription) {
        enhancedUserPrompt += `\n### STRUCTURED JOB DESCRIPTION\n${JSON.stringify(
          structuredJobDescription,
          null,
          2
        )}\n`;
      }

      if (structuredCandidateDetails) {
        enhancedUserPrompt += `\n### STRUCTURED CANDIDATE DETAILS\n${JSON.stringify(
          structuredCandidateDetails,
          null,
          2
        )}\n`;
      }

      enhancedUserPrompt +=
        "\n\nPlease use these structured data extractions to ensure accuracy in your analysis, especially for candidate name, company, role, and other specific details. The structured data should be considered more reliable than information extracted from raw text.";
    }

    const { object: structuredOutput } = await generateObject({
      model: getOpenAiClient(userEmail)("gpt-4o"),
      schema: ExtendedReportSchema,
      schemaName: "interviewReport",
      schemaDescription: "A detailed report on the candidate's performance in the interview",
      system: SYSTEM_PROMPT,
      prompt: enhancedUserPrompt,
      temperature: 0.5,
      headers: {
        "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
        ...(userEmail && { "Helicone-User-Id": userEmail }),
      },
    });

    const result = ExtendedReportSchema.parse(structuredOutput);

    return result;
  } catch (error) {
    // Log the error and rethrow it to be handled by the lambda
    Sentry.withScope((scope) => {
      scope.setExtra("context", "evaluateCV");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error evaluating CV"
    );
    throw error;
  }
}
