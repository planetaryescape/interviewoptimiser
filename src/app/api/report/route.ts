import { withAuth } from "@/lib/auth-middleware";
import { formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/db";
import { interviews, reports } from "~/db/schema";
import { inngest } from "~/lib/inngest";
import { logger } from "~/lib/logger";

export const POST = withAuth(
  async (request, { user }) => {
    try {
      logger.info("Received request at /api/report");
      const {
        jobId: jobIdString,
        interviewId: interviewIdString,
        reportId: reportIdString,
      } = await request.json();
      const jobId = idHandler.decode(jobIdString);
      const interviewId = idHandler.decode(interviewIdString);
      let reportId = reportIdString ? idHandler.decode(reportIdString) : 0;
      logger.info(
        { jobId, interviewId, reportId },
        "Job ID, interview ID and report ID for report generation"
      );

      const userId = user.id;
      if (!userId) {
        logger.error("User not found");
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      reportId = await db.transaction(async (tx) => {
        if (reportId) return reportId;

        const interview = await tx.query.interviews.findFirst({
          where: eq(interviews.id, interviewId),
        });

        if (!interview) {
          logger.error("Interview not found");
          Sentry.withScope((scope) => {
            scope.setExtra("jobId", jobId);
            Sentry.captureException(new Error("Interview not found"));
          });
          return 0;
        }

        const report = await tx
          .insert(reports)
          .values({
            interviewId,
            generalAssessment: "",
            overallScore: 0,
            speakingSkills: "",
            speakingSkillsScore: 0,
            areasOfStrength: "",
            areasForImprovement: "",
            actionableNextSteps: "",
            communicationSkills: "",
            communicationSkillsScore: 0,
            problemSolvingSkills: "",
            problemSolvingSkillsScore: 0,
            technicalKnowledge: "",
            technicalKnowledgeScore: 0,
            teamwork: "",
            teamworkScore: 0,
            adaptability: "",
            adaptabilityScore: 0,
          })
          .returning();

        return report[0].id;
      });

      if (reportId === 0) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
      }

      // Send both events to Inngest
      logger.info({ jobId, reportId, interviewId }, "Sending events to Inngest");
      await inngest.send([
        {
          name: "interview/report.requested",
          data: { jobId, reportId, interviewId, userId },
        },
        {
          name: "interview/audio-save.requested",
          data: { reportId, interviewId, userId },
        },
      ]);

      return NextResponse.json(
        { message: "Report generation and audio reconstruction started" },
        { status: 200 }
      );
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "POST /api/generate");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error queueing report generation"
      );
      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "POST /api/report" }
);
