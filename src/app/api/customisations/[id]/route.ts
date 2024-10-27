import { db } from "@/db";
import { customisations } from "@/db/schema";
import { getUserFromClerkId } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { sanitiseUserInputText } from "@/lib/sanitiseUserInputText";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { createInsertSchema } from "drizzle-zod";
import { NextRequest, NextResponse } from "next/server";

const updateCustomisationSchema = createInsertSchema(customisations).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  logger.info("PUT request received at /api/customisations/[id]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to PUT /api/customisations/[id]");
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
    const validatedData = updateCustomisationSchema.parse(body);

    const data = {
      ...validatedData,
      customInstructions: sanitiseUserInputText(
        validatedData.customInstructions
      ),
    };

    const customisationId = idHandler.decode(params.id);

    const [updatedCustomization] = await db
      .insert(customisations)
      .values({
        ...data,
        id: customisationId,
        userId,
      })
      .onConflictDoUpdate({
        target: [customisations.id],
        set: data,
      })
      .returning();

    if (!updatedCustomization) {
      logger.warn({ userId }, "Failed to update customisation");
      return NextResponse.json(
        formatErrorEntity("Failed to update customisation"),
        {
          status: 500,
        }
      );
    }

    logger.info({ updatedCustomization }, "Successfully updated customisation");
    return NextResponse.json(
      formatEntity(updatedCustomization, "customisation")
    );
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "PUT /api/customisations/[id]");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in PUT /api/customisations/[id]"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
