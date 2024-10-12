import { db } from "@/db";
import { optimizations, sectionsOrder } from "@/db/schema";
import { getUserFromClerkId } from "@/lib/auth";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import { sanitiseUserInputText } from "@/lib/sanitiseUserInputText";
import {
  formatEntity,
  formatEntityList,
  formatErrorEntity,
} from "@/lib/utils/formatEntity";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/serverless";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  logger.info("POST request received at /api/optimizations");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to POST /api/optimizations");
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
    const { submittedCVText, jobDescriptionText, additionalInfo } = body;
    logger.info("Received optimization data");

    const [newOptimization] = await db.transaction(async (tx) => {
      logger.info({}, "Sanitising user input");
      const sanitisedSubmittedCVText = sanitiseUserInputText(submittedCVText, {
        truncate: true,
        maxLength: config.maxTextLengths.cv,
      });
      const sanitisedJobDescriptionText = sanitiseUserInputText(
        jobDescriptionText,
        {
          truncate: true,
          maxLength: config.maxTextLengths.jobDescription,
        }
      );
      const sanitisedAdditionalInfo = sanitiseUserInputText(additionalInfo, {
        truncate: true,
        maxLength: config.maxTextLengths.additionalInfo,
      });

      logger.info({}, "Creating new optimization");
      const [createdOptimisation] = await tx
        .insert(optimizations)
        .values({
          userId,
          submittedCVText: sanitisedSubmittedCVText,
          jobDescriptionText: sanitisedJobDescriptionText,
          additionalInfo: sanitisedAdditionalInfo,
        })
        .returning();

      logger.info(
        { optimizationId: createdOptimisation.id },
        "Successfully created new optimization"
      );

      const [newSectionsOrder] = await tx
        .insert(sectionsOrder)
        .values({
          ...config.defaultSectionsOrder,
          optimizationId: createdOptimisation.id,
        })
        .onConflictDoUpdate({
          target: [sectionsOrder.optimizationId],
          set: {
            ...config.defaultSectionsOrder,
          },
        })
        .returning();

      logger.info(
        {
          optimizationId: createdOptimisation.id,
          sectionsOrderId: newSectionsOrder.id,
        },
        "Successfully created new sections order"
      );

      return [createdOptimisation];
    });

    logger.info(
      { optimizationId: newOptimization.id },
      "Successfully created new optimization"
    );

    return NextResponse.json(formatEntity(newOptimization, "optimization"), {
      status: 201,
    });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "POST /api/optimizations");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in POST /api/optimizations"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}

export async function GET(request: NextRequest) {
  logger.info("GET request received at /api/optimizations");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to GET /api/optimizations");
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

    const userOptimizations = await db.query.optimizations.findMany({
      where: eq(optimizations.userId, userId),
      orderBy: desc(optimizations.createdAt),
      with: {
        cv: true,
        coverLetter: true,
        sectionsOrder: true,
      },
    });

    logger.info(
      { count: userOptimizations.length },
      "Successfully retrieved optimizations"
    );
    return NextResponse.json(
      formatEntityList(userOptimizations, "optimization")
    );
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/optimizations");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/optimizations"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
