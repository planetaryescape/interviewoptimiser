import { getUserFromClerkId } from "@/lib/auth";
import { formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { config } from "~/config";
import { db } from "~/db";
import { interviews, reports } from "~/db/schema";
import { logger } from "~/lib/logger";

const API_GATEWAY_URL = config.apiGatewayUrlAddToQueue;

const API_KEY = process.env.INTERVIEWOPTIMISER_API_KEY;

export async function POST(req: NextRequest) {
  try {
    logger.info("Received request at /api/report");
    const {
      jobId: jobIdString,
      interviewId: interviewIdString,
      reportId: reportIdString,
    } = await req.json();
    const jobId = idHandler.decode(jobIdString);
    const interviewId = idHandler.decode(interviewIdString);
    let reportId = idHandler.decode(reportIdString);
    logger.info(
      { jobId, interviewId, reportId },
      "Job ID, interview ID and report ID for report generation"
    );

    const { userId: clerkUserId } = getAuth(req);
    if (!clerkUserId) {
      logger.error("Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = await getUserFromClerkId(clerkUserId);
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

    // Configure the API requests
    const reportRequest = fetch(API_GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY || "",
      },
      body: JSON.stringify({
        data: {
          jobId,
          reportId,
          interviewId,
        },
        userId,
        queueType: "generate-report",
      }),
    });

    const audioRequest = fetch(API_GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY || "",
      },
      body: JSON.stringify({
        data: {
          jobId,
          reportId,
          interviewId,
        },
        userId,
        queueType: "save-interview-audio-to-s3",
      }),
    });

    // Execute both requests in parallel
    logger.info({ jobId, reportId, interviewId }, "Sending parallel requests to API Gateway");
    const [reportResponse, audioResponse] = await Promise.all([reportRequest, audioRequest]);

    // Parse the JSON responses in parallel
    const [reportResponseData, audioResponseData] = await Promise.all([
      reportResponse.json(),
      audioResponse.json(),
    ]);

    logger.info(
      {
        reportStatus: reportResponse.status,
        audioStatus: audioResponse.status,
      },
      "Received responses from API Gateway"
    );

    // Check if either request failed
    if (!reportResponse.ok || !audioResponse.ok) {
      logger.error(
        {
          reportError: reportResponse.ok ? null : reportResponse.statusText,
          reportStatus: reportResponse.status,
          reportBody: reportResponseData,
          audioError: audioResponse.ok ? null : audioResponse.statusText,
          audioStatus: audioResponse.status,
          audioBody: audioResponseData,
        },
        "Failed to queue one or more tasks"
      );

      // Return the first error
      if (!reportResponse.ok) {
        return NextResponse.json(reportResponseData, {
          status: reportResponse.status,
        });
      } else {
        return NextResponse.json(audioResponseData, {
          status: audioResponse.status,
        });
      }
    }

    return NextResponse.json(
      {
        message: "Report generation and audio reconstruction started",
        reportStatus: reportResponse.status,
        audioStatus: audioResponse.status,
      },
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
}
