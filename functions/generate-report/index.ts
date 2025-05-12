import { getUserFromId } from "@/lib/auth";
import { idHandler } from "@/lib/utils/idHandler";
import { SQSClient } from "@aws-sdk/client-sqs";
import * as Sentry from "@sentry/aws-serverless";
import type { SQSEvent, SQSRecord } from "aws-lambda";
import { eq, sql } from "drizzle-orm";
import { config } from "~/config";
import { db } from "~/db";
import {
  candidateDetails,
  chats,
  interviews,
  jobDescriptions,
  questionAnalysis,
  reports,
  statistics,
} from "~/db/schema";
import { analyseInterview } from "~/lib/ai/analyse-interview";
import { extractCandidateDetails } from "~/lib/ai/extract-candidate-details";
import { extractJobDescription } from "~/lib/ai/extract-job-description";
import { extractOriginalCV } from "~/lib/ai/extract-original-cv";
import { sendDiscordDM } from "~/lib/discord";
import { logger } from "~/lib/logger";
import { getOpenAiClient } from "~/lib/openai";
import { initSentry } from "../lib/sentry";
import { deleteMessage } from "../utils/deleteMessage";
import { handleError } from "../utils/handleError";

initSentry();

const sqs = new SQSClient({ region: process.env.AWS_REGION });

export const handler = Sentry.wrapHandler(async (event: SQSEvent) => {
  try {
    logger.info({ event }, "Received event");

    if (!event.Records?.length) {
      logger.error({ event }, "Invalid event structure: Records is not an array");
      throw new Error("Invalid event structure");
    }

    const successfulRecords: SQSRecord[] = [];
    const failedRecords: SQSRecord[] = [];

    for (const record of event.Records) {
      let interviewId = 0;
      try {
        const {
          data: { interviewId: id, reportId, chatId },
          userId,
          restart: isRestart,
        } = JSON.parse(record.body);
        interviewId = id;

        const user = await getUserFromId(userId);
        logger.info({ interviewId, isRestart }, "Processing interview report request");

        const interview = await db
          .select()
          .from(interviews)
          .where(eq(interviews.id, interviewId))
          .then(([interview]) => interview);

        if (!interview) {
          logger.error({ interviewId }, "Interview not found");
          throw new Error("Interview not found");
        }

        const chat = await db
          .select({
            transcript: chats.transcript,
          })
          .from(chats)
          .where(eq(chats.id, chatId))
          .then(([chat]) => chat);

        if (!chat) {
          logger.error({ chatId }, "Chat not found");
          throw new Error("Chat not found");
        }

        // Get the language model
        const model = getOpenAiClient(user?.email)("o3-mini");

        // Run extraction functions in parallel using Promise.all
        logger.info({ interviewId }, "Starting parallel data extraction");

        const [structuredCV, structuredJobDescription, structuredCandidateDetails] =
          await Promise.all([
            extractOriginalCV({
              model,
              submittedCVText: interview.submittedCVText ?? "",
              userEmail: user?.email,
            }).catch((error) => {
              logger.error({ error }, "Error extracting structured CV data");
              return null;
            }),

            extractJobDescription({
              model,
              jobDescriptionText: interview.jobDescriptionText ?? "",
              userEmail: user?.email,
            }).catch((error) => {
              logger.error({ error }, "Error extracting structured job description");
              return null;
            }),

            extractCandidateDetails({
              model,
              submittedCVText: interview.submittedCVText ?? "",
              userEmail: user?.email,
            }).catch((error) => {
              logger.error({ error }, "Error extracting structured candidate details");
              return null;
            }),
          ]);

        logger.info({ interviewId }, "Parallel data extraction completed");

        // Generate the interview analysis with structured data
        const generatedReport = await analyseInterview({
          model,
          interview,
          transcriptString: chat.transcript ?? "",
          userEmail: user?.email,
          structuredCV: structuredCV?.data,
          structuredJobDescription: structuredJobDescription?.data,
          structuredCandidateDetails: structuredCandidateDetails?.data,
        });

        if (!generatedReport?.data) {
          logger.error("No interview report returned");
          throw new Error("Failed to generate report");
        }

        // Get the report ID
        let updatedReportId: number;

        await db.transaction(async (tx) => {
          // Save structured job description to database if available
          if (structuredJobDescription?.data) {
            await tx
              .insert(jobDescriptions)
              .values({
                interviewId,
                company: structuredJobDescription.data.company,
                role: structuredJobDescription.data.role,
                requiredQualifications: structuredJobDescription.data.requiredQualifications,
                requiredExperience: structuredJobDescription.data.requiredExperience,
                requiredSkills: structuredJobDescription.data.requiredSkills,
                preferredQualifications: structuredJobDescription.data.preferredQualifications,
                preferredSkills: structuredJobDescription.data.preferredSkills,
                responsibilities: structuredJobDescription.data.responsibilities,
                benefits: structuredJobDescription.data.benefits,
                location: structuredJobDescription.data.location,
                employmentType: structuredJobDescription.data.employmentType,
                seniority: structuredJobDescription.data.seniority,
                industry: structuredJobDescription.data.industry,
                keyTechnologies: structuredJobDescription.data.keyTechnologies,
                keywords: structuredJobDescription.data.keywords,
              })
              .onConflictDoNothing();
          }

          // Save structured candidate details to database if available
          if (structuredCandidateDetails?.data) {
            await tx
              .insert(candidateDetails)
              .values({
                interviewId,
                name: structuredCandidateDetails.data.name,
                email: structuredCandidateDetails.data.email,
                phone: structuredCandidateDetails.data.phone,
                location: structuredCandidateDetails.data.location,
                currentRole: structuredCandidateDetails.data.currentRole,
                professionalSummary: structuredCandidateDetails.data.professionalSummary,
                linkedinUrl: structuredCandidateDetails.data.linkedinUrl,
                portfolioUrl: structuredCandidateDetails.data.portfolioUrl,
                otherUrls: structuredCandidateDetails.data.otherUrls,
              })
              .onConflictDoNothing();
          }

          // Update the report with generated analysis
          const updatedReport = await tx
            .insert(reports)
            .values({
              chatId,
              generalAssessment: generatedReport.data.generalAssessment,
              overallScore: generatedReport.data.overallScore,
              speakingSkills: generatedReport.data.speakingSkills,
              speakingSkillsScore: generatedReport.data.speakingSkillsScore,
              communicationSkills: generatedReport.data.communicationSkills,
              communicationSkillsScore: generatedReport.data.communicationSkillsScore,
              problemSolvingSkills: generatedReport.data.problemSolvingSkills,
              problemSolvingSkillsScore: generatedReport.data.problemSolvingSkillsScore,
              technicalKnowledge: generatedReport.data.technicalKnowledge,
              technicalKnowledgeScore: generatedReport.data.technicalKnowledgeScore,
              teamwork: generatedReport.data.teamwork,
              teamworkScore: generatedReport.data.teamworkScore,
              adaptability: generatedReport.data.adaptability,
              adaptabilityScore: generatedReport.data.adaptabilityScore,
              areasOfStrength: JSON.stringify(generatedReport.data.areasOfStrength),
              areasForImprovement: JSON.stringify(generatedReport.data.areasForImprovement),
              actionableNextSteps: JSON.stringify(generatedReport.data.actionableNextSteps),
              isCompleted: true,
            })
            .returning({ id: reports.id });

          updatedReportId = updatedReport[0].id;

          // Save question analyses to the database if available
          if (generatedReport.questionAnalyses && generatedReport.questionAnalyses.length > 0) {
            logger.info(
              `Saving ${generatedReport.questionAnalyses.length} question analyses for report ID ${updatedReportId}`
            );

            // Insert each question analysis
            for (const qa of generatedReport.questionAnalyses) {
              await tx.insert(questionAnalysis).values({
                reportId: updatedReportId,
                question: qa.question,
                analysis: qa.analysis,
                score: qa.score,
                isKeyQuestion: qa.isKeyQuestion,
              });
            }
          }

          // Update the interview with candidate, company, and role information
          await tx
            .update(interviews)
            .set({
              candidate: generatedReport.data.candidateName,
              company: generatedReport.data.companyName,
              role: generatedReport.data.roleName,
              completed: true,
            })
            .where(eq(interviews.id, interviewId));

          // Update global statistics
          await tx
            .update(statistics)
            .set({
              interviewsCount: sql`${statistics.interviewsCount} + 1`,
            })
            .where(eq(statistics.id, 1));
        });

        logger.info(
          { interviewId },
          "Successfully generated and saved interview report with structured data"
        );

        await sendDiscordDM({
          title: "✅ Interview Report Generated",
          metadata: {
            "User ID": userId,
            "User Email": user?.email ?? "Unknown",
            "Interview ID": interviewId,
            "Interview URL": `${
              config.baseUrl
            }/dashboard/interviews/${idHandler.encode(interviewId)}/reports`,
            Company: generatedReport.data.companyName,
            Role: generatedReport.data.roleName,
            "Overall Score": generatedReport.data.overallScore,
          },
        });

        await deleteMessage(sqs, record);
        successfulRecords.push(record);
      } catch (error) {
        Sentry.withScope((scope) => {
          scope.setExtra("context", "handler");
          scope.setExtra("error", error);
          scope.setExtra("event", event);
          scope.setExtra("message", error instanceof Error ? error.message : error);
          Sentry.captureException(error);
        });

        logger.error(
          {
            error: error instanceof Error ? error.message : error,
            interviewId,
          },
          "Error processing interview report request"
        );

        await handleError({
          sqsClient: sqs,
          record,
          error: error as Error,
          onFailure: async () => {
            await sendDiscordDM({
              title: "❌ Interview Report Generation Failed",
              description: "Failed to generate interview report",
              metadata: {
                "Record ID": record.messageId,
                "Interview ID": record.body ? JSON.parse(record.body).data?.interviewId : "unknown",
                Error: error instanceof Error ? error.message : JSON.stringify(error),
                "Stack Trace": error instanceof Error ? error.stack : "N/A",
                Timestamp: new Date().toISOString(),
              },
            });
            failedRecords.push(record);
          },
        });
        failedRecords.push(record);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "All records processed" }),
    };
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : error },
      "Error processing interview report request"
    );
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
});

export default handler;
