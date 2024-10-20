import { db } from "@/db";
import { interviews, reports } from "@/db/schema";
import { openai } from "@/lib/ai/openai";
import { getUserFromClerkId } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { NextRequest, NextResponse } from "next/server";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const ReportSchema = createInsertSchema(reports);

const ExtendedReportSchema = ReportSchema.extend({
  generalAssessment: z
    .string()
    .describe("Overall assessment of the interview performance"),
  overallScore: z
    .number()
    .describe("Overall score of the interview out of 100"),
  speakingSkills: z
    .string()
    .describe("Assessment of the candidate's speaking skills"),
  speakingSkillsScore: z
    .number()
    .describe("Score for speaking skills out of 100"),
  communicationSkills: z
    .string()
    .describe("Assessment of the candidate's communication skills"),
  communicationSkillsScore: z
    .number()
    .describe("Score for communication skills out of 100"),
  problemSolvingSkills: z
    .string()
    .describe("Assessment of the candidate's problem-solving skills"),
  problemSolvingSkillsScore: z
    .number()
    .describe("Score for problem-solving skills out of 100"),
  technicalKnowledge: z
    .string()
    .describe("Assessment of the candidate's technical knowledge"),
  technicalKnowledgeScore: z
    .number()
    .describe("Score for technical knowledge out of 100"),
  teamwork: z
    .string()
    .describe("Assessment of the candidate's teamwork abilities"),
  teamworkScore: z.number().describe("Score for teamwork abilities out of 100"),
  adaptability: z
    .string()
    .describe("Assessment of the candidate's adaptability"),
  adaptabilityScore: z.number().describe("Score for adaptability out of 100"),
  areasOfStrength: z
    .array(z.string())
    .describe("List of the candidate's areas of strength"),
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

export async function POST(request: NextRequest) {
  logger.info("POST request received at /api/report");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to POST /api/report");
    return NextResponse.json(formatErrorEntity("Unauthorized"), {
      status: 401,
    });
  }

  try {
    const { id: userId } = await getUserFromClerkId(clerkUserId);
    if (!userId) {
      logger.warn({ clerkUserId }, "User not found in database");
      return NextResponse.json(formatErrorEntity("User not found"), {
        status: 404,
      });
    }

    const body = await request.json();
    const { interviewId } = body;

    if (!interviewId) {
      return NextResponse.json(formatErrorEntity("Interview ID is required"), {
        status: 400,
      });
    }

    const decodedInterviewId = idHandler.decode(interviewId);

    // Fetch the interview directly from the database
    const [interview] = await db
      .select()
      .from(interviews)
      .where(eq(interviews.id, decodedInterviewId));

    if (!interview) {
      return NextResponse.json(formatErrorEntity("Interview not found"), {
        status: 404,
      });
    }

    // System prompt for OpenAI
    const systemPrompt = `
      You are an expert interview analyst and career coach. Your task is to provide comprehensive, candid, and constructive feedback on interview performances. Aim to be honest, direct, and constructively critical. Follow the principles of Radical Candor: "Care Personally, Challenge Directly." Deliver clear, respectful feedback aimed at empowering the candidate to improve. Use specific examples from the interview to support your points. If the interview information is limited, provide the most useful and actionable report possible with the available data, and recommend a longer mock interview for more comprehensive feedback. Stick to the information provided in the transcript. Provide scores out of 100 for each section and an overall score to help the candidate understand their performance.
    `;

    // User prompt for OpenAI
    const userPrompt = `
      Analyze the following interview transcript and generate a comprehensive, well-formatted report in Markdown (with hierarchical headings, bold, italic, etc.) on the candidate's performance. Focus your analysis on both the content of the interview transcript and the prosody analysis provided for each message.

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
      ${interview.transcript}

      Additional Context (for reference only, not for analysis):
      Submitted CV: ${interview.submittedCVText}
      Job Description: ${interview.jobDescriptionText}
      Additional Information: ${interview.additionalInfo}

      Maintain a candid yet respectful tone throughout the report, adhering to Radical Candor principles. Base your analysis and feedback on both the interview transcript content and the prosody analysis provided for each message.
    `;

    // Generate report using OpenAI
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: zodResponseFormat(
        ExtendedReportSchema,
        "interviewReport"
      ),
    });

    if (!completion.choices[0].message.parsed) {
      logger.error("No interview report returned");
      return NextResponse.json(formatErrorEntity("Failed to generate report"), {
        status: 500,
      });
    }

    const generatedReport = completion.choices[0].message.parsed;

    // Insert the report into the database
    const [newReport] = await db.transaction(async (tx) => {
      const [report] = await tx
        .insert(reports)
        .values({
          interviewId: decodedInterviewId,
          ...generatedReport,
          areasOfStrength: JSON.stringify(generatedReport.areasOfStrength),
          areasForImprovement: JSON.stringify(
            generatedReport.areasForImprovement
          ),
          actionableNextSteps: JSON.stringify(
            generatedReport.actionableNextSteps
          ),
        })
        .returning();

      // Update the interview with the extracted information
      await tx
        .update(interviews)
        .set({
          candidate: generatedReport.candidateName,
          company: generatedReport.companyName,
          role: generatedReport.roleName,
          completed: true,
        })
        .where(eq(interviews.id, decodedInterviewId));

      return [report];
    });

    logger.info(
      { interviewId: decodedInterviewId },
      "Successfully generated and saved interview report, and updated interview details"
    );

    return NextResponse.json(formatEntity(newReport, "report"), {
      status: 200,
    });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "POST /api/report");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in POST /api/report"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
