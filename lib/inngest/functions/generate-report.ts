import ReportCompletedEmail from "@/emails/report-completed";
import { getUserFromId } from "@/lib/auth";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { eq, sql } from "drizzle-orm";
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
import { getModelForOperation } from "~/lib/ai/models";
import { sendDiscordDM } from "~/lib/discord";
import { inngest } from "~/lib/inngest";
import { logger } from "~/lib/logger";
import { resend } from "~/lib/resend";

// Helper function to sanitize strings by removing null characters
const sanitizeString = (str: string | undefined | null): string | null => {
  if (typeof str === "string") {
    return str.replace(/\u0000/g, "");
  }
  return str === undefined ? null : str;
};

export const generateReportFn = inngest.createFunction(
  {
    id: "generate-report",
    retries: 2,
    concurrency: [{ limit: 10 }],
    onFailure: async ({ error, event }) => {
      await sendDiscordDM({
        title: "❌ Interview Report Generation Failed",
        description: "Failed to generate interview report after retries",
        metadata: {
          "Job ID": event.data.event.data.jobId,
          "Report ID": event.data.event.data.reportId,
          Error: error.message,
          Timestamp: new Date().toISOString(),
        },
      });
    },
  },
  { event: "interview/report.requested" },
  async ({ event, step }) => {
    const { jobId, interviewId, reportId, userId, restart: isRestart } = event.data;

    // Step 1: Load data
    const { job, interview, user } = await step.run("load-data", async () => {
      const user = await getUserFromId(userId);

      const job = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, jobId))
        .then(([job]) => job);

      if (!job) throw new Error(`Job not found: ${jobId}`);

      const interview = await db
        .select()
        .from(interviews)
        .where(eq(interviews.id, interviewId))
        .then(([interview]) => interview);

      if (!interview) throw new Error(`Interview not found: ${interviewId}`);

      return { job, interview, user };
    });

    // Step 2: Parallel AI extraction
    const extractionModel = getModelForOperation("extract_original_cv", user?.email);

    const [structuredCV, structuredJobDescription, structuredCandidateDetails] = await Promise.all([
      step.run("extract-cv", () =>
        extractOriginalCV({
          model: extractionModel,
          submittedCVText: job.submittedCVText ?? "",
          userEmail: user?.email,
        }).catch((error) => {
          logger.error({ error }, "Error extracting structured CV data");
          return null;
        })
      ),
      step.run("extract-job-description", () =>
        extractJobDescription({
          model: getModelForOperation("extract_job_description", user?.email),
          jobDescriptionText: job.jobDescriptionText ?? "",
          userEmail: user?.email,
        }).catch((error) => {
          logger.error({ error }, "Error extracting structured job description");
          return null;
        })
      ),
      step.run("extract-candidate-details", () =>
        extractCandidateDetails({
          model: getModelForOperation("extract_candidate_details", user?.email),
          submittedCVText: job.submittedCVText ?? "",
          userEmail: user?.email,
        }).catch((error) => {
          logger.error({ error }, "Error extracting structured candidate details");
          return null;
        })
      ),
    ]);

    // Step 3: Sanitize extracted data
    if (structuredJobDescription?.data) {
      const jdData = structuredJobDescription.data;
      jdData.company = sanitizeString(jdData.company) ?? "";
      jdData.role = sanitizeString(jdData.role) ?? "";
      for (const field of [
        "requiredQualifications",
        "requiredExperience",
        "requiredSkills",
        "preferredQualifications",
        "preferredSkills",
        "responsibilities",
        "benefits",
        "keyTechnologies",
        "keywords",
      ] as const) {
        if (Array.isArray(jdData[field])) {
          (jdData as any)[field] = (jdData[field] as string[]).map((s) => sanitizeString(s) ?? "");
        } else {
          (jdData as any)[field] = [];
        }
      }
      jdData.location = sanitizeString(jdData.location) ?? "";
      jdData.employmentType = sanitizeString(jdData.employmentType) ?? "";
      jdData.seniority = sanitizeString(jdData.seniority) ?? "";
      jdData.industry = sanitizeString(jdData.industry) ?? "";
    }

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

    // Step 4: Analyse interview
    // Rehydrate Date fields that were serialized to strings by step.run
    const rehydratedJob = {
      ...job,
      createdAt: new Date(job.createdAt),
      updatedAt: new Date(job.updatedAt),
    };
    const rehydratedInterview = {
      ...interview,
      createdAt: new Date(interview.createdAt),
      updatedAt: new Date(interview.updatedAt),
    };

    const generatedReport = await step.run("analyse-interview", async () => {
      const result = await analyseInterview({
        model: getModelForOperation("analyse_interview", user?.email),
        job: rehydratedJob,
        transcriptString: interview.transcript ?? "",
        userEmail: user?.email,
        structuredCV: structuredCV?.data,
        structuredJobDescription: structuredJobDescription?.data,
        structuredCandidateDetails: structuredCandidateDetails?.data,
        interview: rehydratedInterview,
      });

      if (!result?.data) throw new Error("Failed to generate report");

      // Sanitize report data
      const reportData = result.data;
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

      for (const field of [
        "areasOfStrength",
        "areasForImprovement",
        "actionableNextSteps",
      ] as const) {
        if (Array.isArray(reportData[field])) {
          (reportData as any)[field] = (reportData[field] as string[]).map(
            (item) => sanitizeString(item) ?? ""
          );
        } else {
          (reportData as any)[field] = [];
        }
      }

      if (result.questionAnalyses?.length) {
        result.questionAnalyses = result.questionAnalyses.map((qa) => ({
          ...qa,
          question: sanitizeString(qa.question) ?? "",
          analysis: sanitizeString(qa.analysis) ?? "",
        }));
      }

      return result;
    });

    // Step 5: Save report to DB
    const reportData = generatedReport.data;
    const interviewType = interview.type || "Interview";
    const company = reportData.companyName || job.company || "Company";
    const role = reportData.roleName || job.role || "Position";

    const updatedReportId = await step.run("save-report", async () => {
      return db.transaction(async (tx): Promise<number> => {
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

        if (generatedReport.questionAnalyses?.length) {
          const existingQAs = await tx.query.questionAnalysis.findMany({
            where: eq(questionAnalysis.reportId, updatedReport[0].id),
          });

          for (const qa of generatedReport.questionAnalyses) {
            await tx.insert(questionAnalysis).values({
              reportId: updatedReport[0].id,
              question: qa.question,
              analysis: qa.analysis,
              score: qa.score,
              isKeyQuestion: qa.isKeyQuestion,
            });
          }

          for (const qa of existingQAs) {
            await tx.delete(questionAnalysis).where(eq(questionAnalysis.id, qa.id));
          }
        }

        await tx
          .update(jobs)
          .set({
            candidate: reportData.candidateName,
            company: reportData.companyName,
            role: reportData.roleName,
            completed: true,
          })
          .where(eq(jobs.id, jobId));

        await tx
          .update(statistics)
          .set({
            interviewsCount: sql`${statistics.interviewsCount} + 1`,
          })
          .where(eq(statistics.id, 1));

        return updatedReport[0].id;
      });
    });

    // Step 6: Send notifications
    await step.run("send-notifications", async () => {
      if (user?.email) {
        try {
          await resend.emails.send({
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
        } catch (emailError) {
          logger.error(
            { error: emailError instanceof Error ? emailError.message : emailError },
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
          )}/interviews/${idHandler.encode(interviewId)}/reports/${idHandler.encode(
            updatedReportId
          )}`,
          Company: reportData.companyName,
          Role: reportData.roleName,
          "Overall Score": reportData.overallScore,
        },
      });
    });

    return { reportId: updatedReportId };
  }
);
