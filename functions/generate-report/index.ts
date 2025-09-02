import { SQSClient } from "@aws-sdk/client-sqs";
import * as Sentry from "@sentry/aws-serverless";
import type { SQSEvent, SQSRecord } from "aws-lambda";
import { eq, sql } from "drizzle-orm";
import ReportCompletedEmail from "@/emails/report-completed";
import { getUserFromId } from "@/lib/auth";
import { idHandler } from "@/lib/utils/idHandler";
import { config } from "~/config";
import { db } from "~/db";
import {
  candidateDetails,
  interviews,
  jobDescriptions,
  jobs,
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
import { resend } from "~/lib/resend";
import { initSentry } from "../lib/sentry";
import { deleteMessage } from "../utils/deleteMessage";
import { handleError } from "../utils/handleError";

initSentry();

const sqs = new SQSClient({ region: process.env.AWS_REGION });

// Helper function to sanitize strings by removing null characters
const sanitizeString = (str: string | undefined | null): string | null => {
  if (typeof str === "string") {
    return str.replace(/\u0000/g, "");
  }
  return str === undefined ? null : str; // Ensure undefined becomes null
};

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
      let jobId = 0;
      try {
        const {
          data: { jobId: id, interviewId, reportId },
          userId,
          restart: isRestart,
        } = JSON.parse(record.body);
        jobId = id;

        const user = await getUserFromId(userId);
        logger.info({ jobId, isRestart }, "Processing interview report request");

        const job = await db
          .select()
          .from(jobs)
          .where(eq(jobs.id, jobId))
          .then(([job]) => job);

        if (!job) {
          logger.error({ jobId }, "Job not found");
          throw new Error("Job not found");
        }

        const interview = await db
          .select()
          .from(interviews)
          .where(eq(interviews.id, interviewId))
          .then(([interview]) => interview);

        if (!interview) {
          logger.error({ interviewId }, "Interview not found");
          throw new Error("Interview not found");
        }

        // Get the language model
        const model = getOpenAiClient(user?.email)("o4-mini");

        // Run extraction functions in parallel using Promise.all
        logger.info({ jobId }, "Starting parallel data extraction");

        const [structuredCV, structuredJobDescription, structuredCandidateDetails] =
          await Promise.all([
            extractOriginalCV({
              model,
              submittedCVText: job.submittedCVText ?? "",
              userEmail: user?.email,
            }).catch((error) => {
              logger.error({ error }, "Error extracting structured CV data");
              return null;
            }),

            extractJobDescription({
              model,
              jobDescriptionText: job.jobDescriptionText ?? "",
              userEmail: user?.email,
            }).catch((error) => {
              logger.error({ error }, "Error extracting structured job description");
              return null;
            }),

            extractCandidateDetails({
              model,
              submittedCVText: job.submittedCVText ?? "",
              userEmail: user?.email,
            }).catch((error) => {
              logger.error({ error }, "Error extracting structured candidate details");
              return null;
            }),
          ]);

        // Sanitize structuredJobDescription.data if it exists
        if (structuredJobDescription?.data) {
          const jdData = structuredJobDescription.data;
          jdData.company = sanitizeString(jdData.company) ?? "";
          jdData.role = sanitizeString(jdData.role) ?? "";
          if (Array.isArray(jdData.requiredQualifications)) {
            jdData.requiredQualifications = jdData.requiredQualifications.map(
              (s) => sanitizeString(s) ?? ""
            );
          } else {
            jdData.requiredQualifications = []; // Assuming type is string[] (non-nullable array)
          }
          if (Array.isArray(jdData.requiredExperience)) {
            jdData.requiredExperience = jdData.requiredExperience.map(
              (s) => sanitizeString(s) ?? ""
            );
          } else {
            jdData.requiredExperience = [];
          }
          if (Array.isArray(jdData.requiredSkills)) {
            jdData.requiredSkills = jdData.requiredSkills.map((s) => sanitizeString(s) ?? "");
          } else {
            jdData.requiredSkills = [];
          }
          if (Array.isArray(jdData.preferredQualifications)) {
            jdData.preferredQualifications = jdData.preferredQualifications.map(
              (s) => sanitizeString(s) ?? ""
            );
          } else {
            jdData.preferredQualifications = [];
          }
          if (Array.isArray(jdData.preferredSkills)) {
            jdData.preferredSkills = jdData.preferredSkills.map((s) => sanitizeString(s) ?? "");
          } else {
            jdData.preferredSkills = [];
          }
          if (Array.isArray(jdData.responsibilities)) {
            jdData.responsibilities = jdData.responsibilities.map((s) => sanitizeString(s) ?? "");
          } else {
            jdData.responsibilities = [];
          }
          if (Array.isArray(jdData.benefits)) {
            jdData.benefits = jdData.benefits.map((s) => sanitizeString(s) ?? "");
          } else {
            jdData.benefits = [];
          }
          jdData.location = sanitizeString(jdData.location) ?? "";
          jdData.employmentType = sanitizeString(jdData.employmentType) ?? "";
          jdData.seniority = sanitizeString(jdData.seniority) ?? "";
          jdData.industry = sanitizeString(jdData.industry) ?? "";
          if (Array.isArray(jdData.keyTechnologies)) {
            jdData.keyTechnologies = jdData.keyTechnologies.map((s) => sanitizeString(s) ?? "");
          } else {
            jdData.keyTechnologies = [];
          }
          if (Array.isArray(jdData.keywords)) {
            jdData.keywords = jdData.keywords.map((s) => sanitizeString(s) ?? "");
          } else {
            jdData.keywords = [];
          }
        }

        // Sanitize structuredCandidateDetails.data if it exists
        if (structuredCandidateDetails?.data) {
          const cdData = structuredCandidateDetails.data;
          cdData.name = sanitizeString(cdData.name) ?? "";
          cdData.email = sanitizeString(cdData.email) ?? "";
          cdData.phone = sanitizeString(cdData.phone) ?? "";
          cdData.location = sanitizeString(cdData.location) ?? "";
          cdData.currentRole = sanitizeString(cdData.currentRole) ?? "";
          cdData.professionalSummary = sanitizeString(cdData.professionalSummary) ?? "";
          cdData.linkedinUrl = sanitizeString(cdData.linkedinUrl) ?? "";
          cdData.portfolioUrl = sanitizeString(cdData.portfolioUrl) ?? "";
          if (Array.isArray(cdData.otherUrls)) {
            cdData.otherUrls = cdData.otherUrls.map((s) => sanitizeString(s) ?? "");
          } else {
            cdData.otherUrls = [];
          }
        }

        logger.info({ jobId }, "Parallel data extraction completed");

        // Generate the interview analysis with structured data
        const generatedReport = await analyseInterview({
          model,
          job,
          transcriptString: interview.transcript ?? "",
          userEmail: user?.email,
          structuredCV: structuredCV?.data,
          structuredJobDescription: structuredJobDescription?.data,
          structuredCandidateDetails: structuredCandidateDetails?.data,
          interview,
        });

        if (!generatedReport?.data) {
          logger.error("No interview report returned");
          throw new Error("Failed to generate report");
        }

        // Sanitize generatedReport.data
        const reportData = generatedReport.data;
        reportData.generalAssessment = sanitizeString(reportData.generalAssessment) ?? "";
        reportData.candidateName = sanitizeString(reportData.candidateName) ?? "";
        reportData.companyName = sanitizeString(reportData.companyName) ?? "";
        reportData.roleName = sanitizeString(reportData.roleName) ?? "";
        if ("fitnessForRole" in reportData) {
          reportData.fitnessForRole =
            sanitizeString(reportData.fitnessForRole as string | null | undefined) ?? "";
        }
        reportData.speakingSkills = sanitizeString(reportData.speakingSkills) ?? "";
        reportData.communicationSkills = sanitizeString(reportData.communicationSkills) ?? "";
        reportData.problemSolvingSkills = sanitizeString(reportData.problemSolvingSkills) ?? "";
        reportData.technicalKnowledge = sanitizeString(reportData.technicalKnowledge) ?? "";
        reportData.teamwork = sanitizeString(reportData.teamwork) ?? "";
        reportData.adaptability = sanitizeString(reportData.adaptability) ?? "";

        if (Array.isArray(reportData.areasOfStrength)) {
          reportData.areasOfStrength = reportData.areasOfStrength.map(
            (item) => sanitizeString(item) ?? ""
          );
        } else {
          reportData.areasOfStrength = []; // Assuming type is string[] (non-nullable array)
        }
        if (Array.isArray(reportData.areasForImprovement)) {
          reportData.areasForImprovement = reportData.areasForImprovement.map(
            (item) => sanitizeString(item) ?? ""
          );
        } else {
          reportData.areasForImprovement = []; // Assuming type is string[] (non-nullable array)
        }
        if (Array.isArray(reportData.actionableNextSteps)) {
          reportData.actionableNextSteps = reportData.actionableNextSteps.map(
            (item) => sanitizeString(item) ?? ""
          );
        } else {
          reportData.actionableNextSteps = []; // Assuming type is string[] (non-nullable array)
        }

        // Sanitize questionAnalyses
        if (generatedReport.questionAnalyses && generatedReport.questionAnalyses.length > 0) {
          generatedReport.questionAnalyses = generatedReport.questionAnalyses.map((qa) => ({
            ...qa,
            question: sanitizeString(qa.question) ?? "",
            analysis: sanitizeString(qa.analysis) ?? "",
          }));
        }

        // Define variables for email
        const interviewType = interview.type || "Interview";
        const company = reportData.companyName || job.company || "Company";
        const role = reportData.roleName || job.role || "Position";

        const updatedReportId = await db.transaction(async (tx): Promise<number> => {
          // Save structured job description to database if available
          if (structuredJobDescription?.data) {
            await tx
              .insert(jobDescriptions)
              .values({
                jobId,
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
                jobId,
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

          logger.info({ generatedReport }, "Generated report");

          // Update the report with generated analysis
          const updatedReport = await tx
            .update(reports)
            .set({
              interviewId,
              generalAssessment: reportData.generalAssessment,
              overallScore: reportData.overallScore,
              speakingSkills: reportData.speakingSkills,
              speakingSkillsScore: reportData.speakingSkillsScore,
              communicationSkills: reportData.communicationSkills,
              communicationSkillsScore: reportData.communicationSkillsScore,
              problemSolvingSkills: reportData.problemSolvingSkills,
              problemSolvingSkillsScore: reportData.problemSolvingSkillsScore,
              technicalKnowledge: reportData.technicalKnowledge,
              technicalKnowledgeScore: reportData.technicalKnowledgeScore,
              teamwork: reportData.teamwork,
              teamworkScore: reportData.teamworkScore,
              adaptability: reportData.adaptability,
              adaptabilityScore: reportData.adaptabilityScore,
              areasOfStrength: JSON.stringify(reportData.areasOfStrength),
              areasForImprovement: JSON.stringify(reportData.areasForImprovement),
              actionableNextSteps: JSON.stringify(reportData.actionableNextSteps),
              isCompleted: true,
            })
            .where(eq(reports.id, reportId))
            .returning({ id: reports.id });

          // Save question analyses to the database if available
          if (generatedReport.questionAnalyses && generatedReport.questionAnalyses.length > 0) {
            logger.info(
              `Saving ${generatedReport.questionAnalyses.length} question analyses for report ID ${updatedReport[0].id}`
            );

            const existingQuestionAnalysesToBeDeleted = await tx.query.questionAnalysis.findMany({
              where: eq(questionAnalysis.reportId, updatedReport[0].id),
            });

            // Insert each question analysis
            for (const qa of generatedReport.questionAnalyses) {
              await tx.insert(questionAnalysis).values({
                reportId: updatedReport[0].id,
                question: qa.question,
                analysis: qa.analysis,
                score: qa.score,
                isKeyQuestion: qa.isKeyQuestion,
              });
            }

            for (const qa of existingQuestionAnalysesToBeDeleted) {
              await tx.delete(questionAnalysis).where(eq(questionAnalysis.id, qa.id));
            }
          }

          // Update the job with candidate, company, and role information
          await tx
            .update(jobs)
            .set({
              candidate: reportData.candidateName,
              company: reportData.companyName,
              role: reportData.roleName,
              completed: true,
            })
            .where(eq(jobs.id, jobId));

          // Update global statistics
          await tx
            .update(statistics)
            .set({
              interviewsCount: sql`${statistics.interviewsCount} + 1`,
            })
            .where(eq(statistics.id, 1));

          return updatedReport[0].id;
        });

        logger.info(
          { jobId },
          "Successfully generated and saved interview report with structured data"
        );

        // Send report completion email to the user
        if (user?.email) {
          logger.info({ email: user.email }, "Sending report completion email");
          try {
            const emailResponse = await resend.emails.send({
              from: `${config.projectName} <reports@${config.domain}>`,
              to: user.email,
              subject: `Your ${interviewType} Interview Report is Ready`,
              react: ReportCompletedEmail({
                firstName: user.firstname ?? "",
                jobId,
                interviewId,
                reportId: updatedReportId,
                interviewType,
                role,
                company,
              }),
            });
            logger.info({ emailResponse }, "Report completion email sent");
          } catch (emailError) {
            logger.error(
              {
                error: emailError instanceof Error ? emailError.message : emailError,
              },
              "Failed to send report completion email"
            );
            Sentry.captureException(emailError);
          }
        }

        await sendDiscordDM({
          title: "✅ Interview Report Generated",
          metadata: {
            "User ID": userId,
            "User Email": user?.email ?? "Unknown",
            "Interview ID": jobId,
            "Interview URL": `${config.baseUrl}/dashboard/jobs/${idHandler.encode(
              jobId
            )}/interviews/${idHandler.encode(
              interviewId
            )}/reports/${idHandler.encode(updatedReportId)}`,
            Company: reportData.companyName,
            Role: reportData.roleName,
            "Overall Score": reportData.overallScore,
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
            jobId,
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
                "Job ID": record.body ? JSON.parse(record.body).data?.jobId : "unknown",
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
