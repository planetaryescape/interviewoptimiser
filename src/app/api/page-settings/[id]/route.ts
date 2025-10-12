import { withAuth } from "@/lib/auth-middleware";
import { encodePageSettings } from "@/lib/utils/encodeHelpers";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/db";
import { pageSettings } from "~/db/schema";
import { logger } from "~/lib/logger";

export const PUT = withAuth<{ id: string }>(
  async (request, { user, params }) => {
    try {
      // Decode hash ID to numeric
      const pageSettingsId = idHandler.safeDecode(params!.id);
      if (pageSettingsId === null) {
        return NextResponse.json(formatErrorEntity("Invalid page settings ID"), {
          status: 404,
        });
      }

      const updatedPageSettings = await request.json();

      const result = await db.transaction(async (tx) => {
        const { id: _, createdAt: _c, updatedAt: _u, ...updateData } = updatedPageSettings;

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

      // Encode IDs before sending to client
      const encodedPageSettings = encodePageSettings(result);
      return NextResponse.json(formatEntity(encodedPageSettings, "page-settings"), {
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
  },
  { routeName: "PUT /api/page-settings/[id]" }
);
