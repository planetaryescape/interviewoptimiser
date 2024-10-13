import { db } from "@/db";
import {
  customSections,
  cvs,
  educations,
  experiences,
  feedback,
  links,
  optimizations,
  sectionsOrder,
  skills,
} from "@/db/schema";
import { getUserFromClerkId } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/serverless";
import { desc, eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  logger.info("GET request received at /api/optimizations/[id]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to GET /api/optimizations/[id]");
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

    const optimizationId = idHandler.decode(params.id);

    const userOptimization = await db.query.optimizations.findFirst({
      orderBy: desc(optimizations.createdAt),
      with: {
        cv: true,
        feedback: true,
      },
      where: eq(optimizations.id, optimizationId),
    });

    logger.info(
      { id: userOptimization?.id },
      "Successfully retrieved optimization"
    );
    return NextResponse.json(formatEntity(userOptimization, "optimization"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/optimizations/[id]");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/optimizations/[id]"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}

const optimizationSchema = createInsertSchema(optimizations)
  .omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    sectionsOrder: createInsertSchema(sectionsOrder).omit({
      id: true,
      optimizationId: true,
      createdAt: true,
      updatedAt: true,
    }),
  });

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  logger.info("PUT request received at /api/optimizations/[id]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to PUT /api/optimizations/[id]");
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

    const optimizationId = idHandler.decode(params.id);
    const body = await request.json();
    const inputOptimisation = optimizationSchema.parse(body);

    // Ensure the optimization belongs to the user
    const existingOptimization = await db.query.optimizations.findFirst({
      where: eq(optimizations.id, optimizationId),
      with: {
        sectionsOrder: true,
      },
    });

    if (!existingOptimization || existingOptimization.userId !== userId) {
      logger.warn(
        { optimizationId, userId },
        "Optimization not found or unauthorized"
      );
      return NextResponse.json(
        formatErrorEntity("Optimization not found or unauthorized"),
        {
          status: 404,
        }
      );
    }
    const [updatedResult] = await db.transaction(async (tx) => {
      const [updatedOptimization] = await tx
        .update(optimizations)
        .set({
          submittedCVText: inputOptimisation.submittedCVText,
          jobDescriptionText: inputOptimisation.jobDescriptionText,
          additionalInfo: inputOptimisation.additionalInfo,
          isCvComplete: inputOptimisation.isCvComplete,
          isCoverLetterComplete: inputOptimisation.isCoverLetterComplete,
          cvError: inputOptimisation.cvError,
          coverLetterError: inputOptimisation.coverLetterError,
          score: inputOptimisation.score,
          candidate: inputOptimisation.candidate,
          company: inputOptimisation.company,
          role: inputOptimisation.role,
        })
        .where(eq(optimizations.id, optimizationId))
        .returning();

      const sectionsOrderData = {
        customSections: inputOptimisation.sectionsOrder.customSections,
        summary: inputOptimisation.sectionsOrder.summary,
        experiences: inputOptimisation.sectionsOrder.experiences,
        links: inputOptimisation.sectionsOrder.links,
        educations: inputOptimisation.sectionsOrder.educations,
        skills: inputOptimisation.sectionsOrder.skills,
      };

      await tx
        .insert(sectionsOrder)
        .values({
          ...sectionsOrderData,
          optimizationId: updatedOptimization.id,
        })
        .onConflictDoUpdate({
          target: [sectionsOrder.optimizationId],
          set: sectionsOrderData,
        })
        .returning();

      return [updatedOptimization];
    });

    logger.info({ id: updatedResult.id }, "Successfully updated optimization");
    return NextResponse.json(formatEntity(updatedResult, "optimization"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "PUT /api/optimizations/[id]");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in PUT /api/optimizations/[id]"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  logger.info("DELETE request received at /api/optimizations/[id]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn(
      "Unauthorized access attempt to DELETE /api/optimizations/[id]"
    );
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

    const optimizationId = idHandler.decode(params.id);

    await db.transaction(async (tx) => {
      const [cv] = await tx
        .select({ id: cvs.id })
        .from(cvs)
        .where(eq(cvs.optimizationId, optimizationId));

      // Delete CV-related data
      await tx.delete(experiences).where(eq(experiences.cvId, cv.id));
      await tx.delete(educations).where(eq(educations.cvId, cv.id));
      await tx.delete(skills).where(eq(skills.cvId, cv.id));
      await tx.delete(links).where(eq(links.cvId, cv.id));
      await tx.delete(customSections).where(eq(customSections.cvId, cv.id));

      await tx
        .delete(feedback)
        .where(eq(feedback.optimizationId, optimizationId));

      await tx
        .delete(sectionsOrder)
        .where(eq(sectionsOrder.optimizationId, optimizationId));

      // Delete CV
      await tx.delete(cvs).where(eq(cvs.optimizationId, optimizationId));

      // Delete optimization
      const result = await tx
        .delete(optimizations)
        .where(eq(optimizations.id, optimizationId))
        .returning();

      if (result.length === 0) {
        throw new Error("Optimization not found");
      }
    });

    logger.info(
      { optimizationId },
      "Successfully deleted optimization and related data"
    );
    return NextResponse.json({ message: "Optimization deleted successfully" });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "DELETE /api/optimizations/[id]");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in DELETE /api/optimizations/[id]"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
