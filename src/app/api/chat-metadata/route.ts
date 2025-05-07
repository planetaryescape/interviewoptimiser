import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { chatMetadata, interviews, reports } from "~/db/schema";
import { logger } from "~/lib/logger";

/**
 * Creates a new chat metadata entry in an idempotent way.
 *
 * If a chat metadata record with the same chatGroupId, chatId, and requestId already exists,
 * returns the existing record and does not create a new report or chat metadata entry.
 * Otherwise, creates a new report and a new chat metadata entry, linking them appropriately.
 *
 * This endpoint is idempotent: repeated POSTs with the same identifiers will not create duplicates.
 */
export async function POST(request: NextRequest) {
  logger.info("POST request received at /api/chat-metadata");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to POST /api/chat-metadata");
    return NextResponse.json(formatErrorEntity("Unauthorized"), {
      status: 401,
    });
  }

  try {
    const { id: userId, role } = await getUserFromClerkId(clerkUserId);
    if (!userId) {
      logger.warn({ clerkUserId }, "User not found in database");
      return NextResponse.json(formatErrorEntity("User not found"), {
        status: 404,
      });
    }

    const body = await request.json();
    const {
      customSessionId,
      chatGroupId,
      chatId,
      requestId,
      interviewId: interviewIdString,
    } = body;

    if (!interviewIdString) {
      logger.warn("Missing required field: interviewId");
      return NextResponse.json(formatErrorEntity("Missing required field: interviewId"), {
        status: 400,
      });
    }

    const interviewId = idHandler.decode(interviewIdString);

    if (!chatGroupId) {
      logger.warn("Missing required field: chatGroupId");
      return NextResponse.json(formatErrorEntity("Missing required field: chatGroupId"), {
        status: 400,
      });
    }

    if (!chatId) {
      logger.warn("Missing required field: chatId");
      return NextResponse.json(formatErrorEntity("Missing required field: chatId"), {
        status: 400,
      });
    }

    // Check if the interview exists and belongs to the user
    const interview = await db.query.interviews.findFirst({
      where: eq(interviews.id, interviewId),
    });

    if (!interview) {
      logger.warn({ interviewId }, "Interview not found");
      return NextResponse.json(formatErrorEntity("Interview not found"), {
        status: 404,
      });
    }

    if (interview.userId !== userId && role !== "admin") {
      logger.warn({ interviewId, userId }, "Unauthorized access to interview");
      return NextResponse.json(formatErrorEntity("Unauthorized"), {
        status: 401,
      });
    }

    const existingChatMetadata = await db.query.chatMetadata.findFirst({
      where: and(
        eq(chatMetadata.chatGroupId, chatGroupId),
        eq(chatMetadata.chatId, chatId),
        eq(chatMetadata.requestId, requestId)
      ),
    });

    if (existingChatMetadata) {
      logger.info({ interviewId }, "Chat metadata already exists");
      return NextResponse.json(formatEntity(existingChatMetadata, "chatMetadata"), {
        status: 200,
      });
    }

    const [newChatMetadata] = await db.transaction(async (tx) => {
      const [createdReport] = await tx
        .insert(reports)
        .values({
          interviewId,
          generalAssessment: "",
          overallScore: 0,
          speakingSkills: "",
          speakingSkillsScore: 0,
          transcript: "",
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

      const [createdChatMetadata] = await db
        .insert(chatMetadata)
        .values({
          reportId: createdReport.id,
          customSessionId,
          chatGroupId,
          chatId,
          requestId,
        })
        .returning();

      return [createdChatMetadata];
    });

    logger.info({ id: newChatMetadata.id }, "Successfully created chat metadata");

    return NextResponse.json(formatEntity(newChatMetadata, "chatMetadata"), {
      status: 201,
    });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "POST /api/chat-metadata");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in POST /api/chat-metadata"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}

/**
 * Gets chat metadata entries for the user
 * Optional query param: interviewId to filter by interview
 */
export async function GET(request: NextRequest) {
  logger.info("GET request received at /api/chat-metadata");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to GET /api/chat-metadata");
    return NextResponse.json(formatErrorEntity("Unauthorized"), {
      status: 401,
    });
  }

  try {
    const { id: userId, role } = await getUserFromClerkId(clerkUserId);
    if (!userId) {
      logger.warn({ clerkUserId }, "User not found in database");
      return NextResponse.json(formatErrorEntity("User not found"), {
        status: 404,
      });
    }

    const url = new URL(request.url);
    const reportId = url.searchParams.get("reportId");

    if (!reportId) {
      logger.info("No reportId provided, getting all chat metadata");
      return NextResponse.json(formatErrorEntity("Missing reportId"), {
        status: 400,
      });
    }

    // Check if the interview exists and belongs to the user
    const report = await db.query.reports.findFirst({
      where: eq(reports.id, Number.parseInt(reportId)),
      with: {
        interview: true,
      },
    });

    if (!report) {
      logger.warn({ reportId }, "Report not found");
      return NextResponse.json(formatErrorEntity("Report not found"), {
        status: 404,
      });
    }

    if (report.interview.userId !== userId && role !== "admin") {
      logger.warn({ reportId, userId }, "Unauthorized access to report");
      return NextResponse.json(formatErrorEntity("Unauthorized"), {
        status: 401,
      });
    }

    const metadata = await db.query.chatMetadata.findFirst({
      where: eq(chatMetadata.reportId, Number.parseInt(reportId)),
    });

    if (!metadata) {
      logger.info({ reportId }, "No chat metadata found for this report");
      return NextResponse.json(formatEntityList([], "generic"));
    }

    logger.info({ reportId }, "Successfully retrieved chat metadata for report");
    return NextResponse.json(formatEntity(metadata, "chatMetadata"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/chat-metadata");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/chat-metadata"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
