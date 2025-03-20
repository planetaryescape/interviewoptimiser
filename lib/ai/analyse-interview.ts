import type { LanguageModelV1 } from "@ai-sdk/provider";
import * as Sentry from "@sentry/nextjs";
import { generateObject } from "ai";
import { createInsertSchema } from "drizzle-zod";
import type { CompletionUsage } from "openai/resources/completions.mjs";
import * as R from "remeda";
import { z } from "zod";
import { reports } from "~/db/schema";
import type { Interview as InterviewSchema } from "~/db/schema/interviews";
import type { CandidateDetails } from "~/lib/ai/extract-candidate-details";
import type { StructuredJobDescriptionSchema } from "~/lib/ai/extract-job-description";
import type { StructuredOriginalCVSchema } from "~/lib/ai/extract-original-cv";
import { logger } from "~/lib/logger";

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

export type InterviewReport = z.infer<typeof ExtendedReportSchema>;

const SYSTEM_PROMPT = `
You are an expert interview analyst and career coach specializing in providing highly detailed, candid, and actionable feedback. Your analysis must follow the principles of Radical Candor: "Care Personally, Challenge Directly."

CORE PRINCIPLES:
1. BE DIRECT AND HONEST: Do not soften critical feedback. If something is poor, say so directly.
2. CITE SPECIFIC EVIDENCE: Every evaluation point must reference specific examples from the interview transcript.
3. EXPLAIN IMPACT: For each strength or weakness, explain its real-world impact in a professional setting.
4. PROVIDE ACTIONABLE GUIDANCE: All feedback must be concrete enough that the candidate can immediately begin improving.
5. USE THE FULL SCORING RANGE: Do not cluster scores in the 70-90% range. Use the entire 0-100 scale deliberately.

SCORING GUIDELINES:
- 0-10: Critically deficient - Would actively harm team/company performance
- 11-30: Significant gaps - Far below minimum expectations for the role
- 31-50: Below average - Missing key competencies needed for the role
- 51-65: Average - Meets basic requirements but doesn't stand out
- 66-80: Above average - Demonstrates solid competencies for the role
- 81-90: Excellent - Exceeds expectations in meaningful ways
- 91-100: Exceptional - Among the top performers you've evaluated

For each score, justify it with specific examples from the transcript. Do not inflate scores - a score of 85+ should be rare and truly impressive. The same applies to very low scores - use them when warranted with clear evidence.

SPECIAL CONSIDERATIONS:
- For extremely nervous candidates (evidenced in prosody data), distinguish between anxiety effects and actual competency issues.
- For non-native speakers, distinguish between language proficiency issues and actual communication deficiencies.
- If technical/audio issues appear to affect the evaluation, acknowledge these limitations.

Your goal is to provide the most useful, honest, and actionable feedback that will genuinely help the candidate improve, even if that feedback might be difficult to hear.
`;

const USER_PROMPT = `
Analyze the provided interview transcript and generate a comprehensive, detailed, and brutally honest report on the candidate's performance.

FORMAT REQUIREMENTS:
- Use proper Markdown formatting with hierarchical headings, bullet points, and emphasis where appropriate
- Include direct quotes from the transcript to support your points
- Provide numerical scores (0-100) for each evaluation category
- Word count is not a factor - be as thorough as needed

IMPORTANT CONTEXT:
- The structured data provided contains accurate information about the candidate, company, and role
- Use the candidate name, company name, and role name from the structured data (particularly from structured candidate details and job description)
- Do NOT attempt to extract these details from the transcript itself
- If structured data is not available, only then extract these details from the transcript

YOUR OUTPUT MUST INCLUDE THE FOLLOWING ASSESSMENTS, which will be captured in our structured schema:

1. GENERAL ASSESSMENT
   - Provide a comprehensive overall assessment of the interview performance
   - Include a clear statement about hiring recommendation
   - Score out of 100 with explicit justification
   - MUST INCLUDE at least 3 specific examples from the transcript with direct quotes

2. FITNESS FOR ROLE
   - Assessment of how well the candidate's experience and skills match the job requirements
   - Score out of 100 with explicit justification
   - Use specific examples (direct quotes) to support your assessment

3. SPEAKING SKILLS
   - Assessment of clarity, fluency, pace, tone, filler words, hesitation
   - Score out of 100 with explicit justification
   - Use specific examples (direct quotes) to support your assessment

4. COMMUNICATION SKILLS
   - Assessment of organization, relevance, depth, examples, persuasiveness
   - Score out of 100 with explicit justification
   - Use specific examples (direct quotes) to support your assessment

5. PROBLEM-SOLVING SKILLS
   - Assessment of approach, creativity, thoroughness, practicality
   - Score out of 100 with explicit justification
   - Use specific examples (direct quotes) to support your assessment

6. TECHNICAL KNOWLEDGE
   - Assessment of accuracy, depth, application, awareness of limitations
   - Score out of 100 with explicit justification
   - Use specific examples (direct quotes) to support your assessment

7. TEAMWORK
   - Assessment of evidence of effective team interactions, conflict resolution
   - Score out of 100 with explicit justification
   - Use specific examples (direct quotes) to support your assessment

8. ADAPTABILITY
   - Assessment of response to challenges, learning agility, flexibility
   - Score out of 100 with explicit justification
   - Use specific examples (direct quotes) to support your assessment

9. AREAS OF STRENGTH
   - List 3-5 specific strengths with evidence from the transcript
   - Each strength must cite specific evidence from the transcript
   - Explain the workplace impact of each strength

10. AREAS FOR IMPROVEMENT
    - List 3-5 specific areas where the candidate can improve
    - Each weakness must cite specific evidence from the transcript
    - Explain the workplace impact of each weakness

11. ACTIONABLE NEXT STEPS
    - List specific, practical steps the candidate can take to improve
    - Include industry-specific recommendations when applicable
    - Provide specific metrics to track improvement

12. CANDIDATE, COMPANY, AND ROLE INFORMATION
    - Provide the candidate's name
    - Provide the company name being applied to
    - Provide the role/position name being applied for

SPECIAL CASES HANDLING:

NERVOUSNESS: If prosody data indicates high anxiety (nervousness, stress, uncertainty):
- Acknowledge how anxiety may have affected performance
- Distinguish between anxiety effects and actual competence issues
- Provide specific techniques for managing interview anxiety
- Still provide candid feedback on performance issues unrelated to nervousness

LANGUAGE/CULTURAL DIFFERENCES: If the candidate appears to be a non-native speaker:
- Distinguish between language proficiency issues and substantive communication skills
- Note any cultural differences that might impact interview style or content
- Provide language-specific improvement recommendations if relevant
- Evaluate whether language barriers would significantly impact job performance

TECHNICAL DIFFICULTIES: If audio quality or technical issues may have affected the evaluation:
- Acknowledge these limitations clearly
- Focus more heavily on content analysis rather than delivery
- Note if certain aspects couldn't be fairly evaluated due to technical issues

STRUCTURED DATA:
{{STRUCTURED_DATA}}

Remember: Your goal is to provide RADICAL CANDOR - honest, sometimes difficult feedback delivered with the genuine intent to help the candidate improve. Do not sugarcoat significant issues, but ensure all criticism comes with specific, actionable guidance.

Interview Transcript:
{{TRANSCRIPT}}

Additional Context (for reference only, not for analysis):
Submitted CV: {{CV}}
Job Description: {{JD}}
Additional Information: {{ADDITIONAL_INFO}}
`;

/**
 * Interface for analysing interview parameters
 */
export interface AnalyseInterviewParams {
  /**
   * The language model to use for analysis
   */
  model: LanguageModelV1;
  /**
   * The interview object containing basic information
   */
  interview: InterviewSchema;
  /**
   * The transcript of the interview in JSON string format
   */
  transcriptString: string;
  /**
   * Optional user email for tracking purposes
   */
  userEmail?: string;
  /**
   * Optional structured CV data extracted from the submitted CV
   */
  structuredCV?: z.infer<typeof StructuredOriginalCVSchema>;
  /**
   * Optional structured job description data
   */
  structuredJobDescription?: z.infer<typeof StructuredJobDescriptionSchema>;
  /**
   * Optional structured candidate details
   */
  structuredCandidateDetails?: CandidateDetails;
}

/**
 * Generates a detailed analysis report for an interview
 * @param params - Object containing all parameters for the analysis
 * @returns A structured report with scores and analysis along with usage information
 */
export async function analyseInterview({
  model,
  interview,
  transcriptString,
  userEmail,
  structuredCV,
  structuredJobDescription,
  structuredCandidateDetails,
}: AnalyseInterviewParams): Promise<{
  data: InterviewReport;
  usage: CompletionUsage;
}> {
  logger.info("Generating interview analysis report");
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

    // Format structured data for the prompt
    let structuredDataText = "No structured data available for this analysis.";

    // If we have any structured data, format it properly
    if (structuredCV || structuredJobDescription || structuredCandidateDetails) {
      structuredDataText =
        "The following structured data has been extracted and should be used to inform your analysis:";

      if (structuredCandidateDetails) {
        structuredDataText += `\n\n### CANDIDATE DETAILS\n${JSON.stringify(
          structuredCandidateDetails,
          null,
          2
        )}`;
      }

      if (structuredJobDescription) {
        structuredDataText += `\n\n### JOB DESCRIPTION\n${JSON.stringify(
          structuredJobDescription,
          null,
          2
        )}`;
      }

      if (structuredCV) {
        structuredDataText += `\n\n### CV DATA\n${JSON.stringify(structuredCV, null, 2)}`;
      }

      structuredDataText +=
        "\n\nUse this structured data as the primary source for candidate name, company name, role details, and other factual information. This data is more reliable than information you might extract from the raw transcript.";
    }

    // Replace all placeholders in the user prompt
    const enhancedUserPrompt = USER_PROMPT.replace("{{TRANSCRIPT}}", JSON.stringify(transcript))
      .replace("{{CV}}", interview.submittedCVText)
      .replace("{{JD}}", interview.jobDescriptionText)
      .replace("{{ADDITIONAL_INFO}}", interview.additionalInfo ?? "")
      .replace("{{STRUCTURED_DATA}}", structuredDataText);

    // Generate the structured output
    const { object: structuredOutput, usage } = await generateObject({
      model,
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

    // Validate the output against the schema
    const validatedOutput = ExtendedReportSchema.parse(structuredOutput);

    return {
      data: validatedOutput,
      usage: {
        prompt_tokens: usage.promptTokens,
        completion_tokens: usage.completionTokens,
        total_tokens: usage.promptTokens + usage.completionTokens,
      },
    };
  } catch (error) {
    // Log the error and rethrow it to be handled by the lambda
    Sentry.withScope((scope) => {
      scope.setExtra("context", "analyseInterview");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error generating interview analysis report"
    );
    throw error;
  }
}
