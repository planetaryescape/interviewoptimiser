import { Interview, interviews, reports } from "@/db/schema";
import { getOpenAiClient } from "@/lib/ai/openai";
import {
  ChangeMessageVisibilityCommand,
  DeleteMessageCommand,
  MessageAttributeValue,
  SendMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";
import * as Sentry from "@sentry/serverless";
import { SQSEvent, SQSRecord } from "aws-lambda";
import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { zodResponseFormat } from "openai/helpers/zod";
import * as R from "remeda";
import { z } from "zod";

import { db } from "@/db";
import { getUserFromId } from "@/lib/auth";
import { logger } from "@/lib/logger";

const sqs = new SQSClient({ region: process.env.LAMBDA_AWS_REGION });

const ReportSchema = createInsertSchema(reports);

const ExtendedReportSchema = ReportSchema.extend({
  generalAssessment: z
    .string()
    .describe("Overall assessment of the interview performance"),
  overallScore: z
    .number()
    .describe("Overall score of the interview out of 100"),
  fitnessForRole: z
    .string()
    .describe("Assessment of the candidate's fitness for the role"),
  fitnessForRoleScore: z
    .number()
    .describe("Score for fitness for the role out of 100"),
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

// First get raw analysis from o1-review
const getInitialAnalysis = async (interview: Interview, userEmail?: string) => {
  if (!interview.transcript) {
    throw new Error("No transcript found");
  }

  const transcript = JSON.parse(interview.transcript).map(
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
        R.take(3)
      ),
    })
  );

  logger.info({ transcript }, "Transcript");

  const systemPrompt = `
    You are an expert interview analyst and career coach. Your task is to provide very detailed, comprehensive, candid, and constructive feedback on interview performances. Aim to be honest, direct, and constructively critical. Follow the principles of Radical Candor: "Care Personally, Challenge Directly." Do not be afraid to call out a bad performance as long as you can back it up with specific reasons or examples from the interview. Deliver clear, respectful feedback aimed at empowering the candidate to improve. Use specific examples from the interview to support your points. If the interview information is limited, provide the most useful and actionable report possible with the available data, **and recommend a longer mock interview for more comprehensive feedback.** Stick to the information provided in the transcript. Provide scores out of 100 for each section and an overall score to help the candidate understand their performance.
  `;

  const userPrompt = `
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
    ${JSON.stringify(transcript)}

    Additional Context (for reference only, not for analysis):
    Submitted CV: ${interview.submittedCVText}
    Job Description: ${interview.jobDescriptionText}
    Additional Information: ${interview.additionalInfo}

    Maintain a candid yet respectful tone throughout the report, adhering to Radical Candor principles. Base your analysis and feedback on both the interview transcript content and the prosody analysis provided for each message. Do not be afraid to call out a bad performance as long as you can back it up with specific reasons or examples from the interview.
  `;

  const initialCompletion = await getOpenAiClient(
    userEmail
  ).beta.chat.completions.parse({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.5,
    response_format: zodResponseFormat(ExtendedReportSchema, "interviewReport"),
  });

  return initialCompletion.choices[0].message.parsed;
};

// Then format with gpt-4o
const formatAnalysis = async (
  rawAnalysis: string,
  interview: Interview,
  userEmail?: string
) => {
  const formattingPrompt = `
    Take the following interview analysis and format it according to the schema requirements.
    Extract all the necessary information and scores, ensuring the output matches the required format.

    Raw Analysis:
    ${rawAnalysis}

    Additional Context (for reference only, not for analysis):
    Submitted CV: ${interview.submittedCVText}
    Job Description: ${interview.jobDescriptionText}
    Additional Information: ${interview.additionalInfo}
  `;

  const completion = await getOpenAiClient(
    userEmail
  ).beta.chat.completions.parse({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are a data formatter. Take the provided interview analysis and extract the required information into the specified schema format.",
      },
      { role: "user", content: formattingPrompt },
    ],
    temperature: 0.3,
    response_format: zodResponseFormat(ExtendedReportSchema, "interviewReport"),
  });

  return completion.choices[0].message.parsed;
};

export const handler = Sentry.AWSLambda.wrapHandler(async (event: SQSEvent) => {
  try {
    logger.info({ event }, "Received event");

    if (!event.Records || !Array.isArray(event.Records)) {
      logger.error(
        { event },
        "Invalid event structure: Records is not an array"
      );
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid event structure" }),
      };
    }

    for (const record of event.Records) {
      let interviewId: number = 0;
      try {
        const message = JSON.parse(record.body);
        interviewId = message.interviewId;
        const userId = message.userId;

        const user = await getUserFromId(userId);

        logger.info({ interviewId }, "Processing interview report request");

        // Fetch the interview directly from the database
        const [interview] = await db
          .select()
          .from(interviews)
          .where(eq(interviews.id, interviewId));

        if (!interview) {
          logger.error({ interviewId }, "Interview not found");
          return {
            statusCode: 404,
            body: JSON.stringify({ error: "Interview not found" }),
          };
        }

        // First, get the detailed analysis from o1-review
        const generatedReport = await getInitialAnalysis(
          interview,
          user?.email
        );

        if (!generatedReport) {
          logger.error("No interview report returned");
          return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to generate report" }),
          };
        }

        logger.info({ generatedReport }, "Generate Report");

        // Then, format the analysis using gpt-4o
        // const generatedReport = await formatAnalysis(rawAnalysis, interview, userEmail);

        if (!generatedReport) {
          logger.error("No interview report returned");
          return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to generate report" }),
          };
        }

        await db.transaction(async (tx) => {
          await tx
            .insert(reports)
            .values({
              interviewId,
              ...generatedReport,
              areasOfStrength: JSON.stringify(generatedReport.areasOfStrength),
              areasForImprovement: JSON.stringify(
                generatedReport.areasForImprovement
              ),
              actionableNextSteps: JSON.stringify(
                generatedReport.actionableNextSteps
              ),
            })
            .onConflictDoUpdate({
              target: [reports.interviewId],
              set: {
                ...generatedReport,
                areasOfStrength: JSON.stringify(
                  generatedReport.areasOfStrength
                ),
                areasForImprovement: JSON.stringify(
                  generatedReport.areasForImprovement
                ),
                actionableNextSteps: JSON.stringify(
                  generatedReport.actionableNextSteps
                ),
              },
            });

          await tx
            .update(interviews)
            .set({
              candidate: generatedReport.candidateName,
              company: generatedReport.companyName,
              role: generatedReport.roleName,
              completed: true,
            })
            .where(eq(interviews.id, interviewId));
        });

        logger.info(
          { interviewId },
          "Successfully generated and saved interview report, and updated interview details"
        );

        // If the report generation is successful, delete the message from the queue
        await deleteMessage(record);

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "Interview report generated successfully",
          }),
        };
      } catch (error) {
        Sentry.withScope((scope) => {
          scope.setExtra("context", "handler");
          scope.setExtra("error", error);
          scope.setExtra(
            "message",
            error instanceof Error ? error.message : error
          );

          Sentry.captureException(error);
        });
        logger.error(
          {
            error: error instanceof Error ? error.message : error,
            interviewId,
          },
          "Error processing interview report request"
        );
        await handleError(record, error as Error, interviewId);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "All records processed" }),
    };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : error,
      },
      "Error processing interview report request"
    );
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
});

async function deleteMessage(record: SQSRecord): Promise<void> {
  const deleteCommand = new DeleteMessageCommand({
    QueueUrl: process.env.SQS_QUEUE_URL!,
    ReceiptHandle: record.receiptHandle,
  });
  await sqs.send(deleteCommand);
  logger.info("Message deleted from queue");
}

async function handleError(
  record: SQSRecord,
  error: Error,
  interviewId: number
): Promise<void> {
  const receiveCount = parseInt(record.attributes.ApproximateReceiveCount, 10);

  if (receiveCount < 3) {
    logger.warn({ interviewId, receiveCount }, "Retrying interview report");
    // Explicitly return the message to the queue for retry
    const changeVisibilityCommand = new ChangeMessageVisibilityCommand({
      QueueUrl: process.env.SQS_QUEUE_URL!,
      ReceiptHandle: record.receiptHandle,
      VisibilityTimeout: 0, // This makes the message immediately visible again
    });
    await sqs.send(changeVisibilityCommand);
  } else {
    logger.error(
      { interviewId, receiveCount },
      "Max retries reached, sending to DLQ"
    );

    // Update the interview status in the database
    await db
      .update(interviews)
      .set({ completed: true })
      .where(eq(interviews.id, interviewId));

    // Explicitly move the message to the DLQ
    const transformedAttributes = Object.entries(
      record.messageAttributes
    ).reduce((acc, [key, value]) => {
      acc[key] = { DataType: value.dataType, StringValue: value.stringValue };
      return acc;
    }, {} as Record<string, MessageAttributeValue>);

    const sendMessageCommand = new SendMessageCommand({
      QueueUrl: process.env.DLQ_URL!,
      MessageBody: record.body,
      MessageAttributes: transformedAttributes,
    });
    await sqs.send(sendMessageCommand);

    // Delete the message from the original queue
    await deleteMessage(record);
  }
}
