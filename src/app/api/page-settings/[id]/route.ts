import { db } from "@/db";
import { pageSettings } from "@/db/schema";
import { getUserFromClerkId } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/serverless";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  logger.info("PUT request received at /api/page-settings/[id]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to PUT /api/page-settings/[id]");
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

    const pageSettingsId = idHandler.decode(params.id);
    const updatedPageSettings = await request.json();

    const result = await db.transaction(async (tx) => {
      const {
        id: _,
        createdAt: _c,
        updatedAt: _u,
        ...updateData
      } = updatedPageSettings;

      // Update page settings
      const [updatedPageSettingsResult] = await tx
        .update(pageSettings)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(pageSettings.id, pageSettingsId))
        .returning();

      return updatedPageSettingsResult;
    });

    logger.info({ pageSettingsId }, "Successfully updated page settings");
    return NextResponse.json(formatEntity(result, "page-settings"), {
      status: 200,
    });
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "PUT /api/page-settings/[id]");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in PUT /api/page-settings/[id]"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
