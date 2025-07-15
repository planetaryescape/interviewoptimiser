import { withAuth } from "@/lib/auth-middleware";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/db";
import { changelogs } from "~/db/schema";
import { logger } from "~/lib/logger";

export const PUT = withAuth<{ id: string }>(
  async (request, { user, params }) => {
    try {
      const changelogId = idHandler.decode(params!.id);

      const [updatedChangelog] = await db
        .update(changelogs)
        .set({ likes: sql`${changelogs.likes} + 1` })
        .where(eq(changelogs.id, changelogId))
        .returning();

      if (!updatedChangelog) {
        return NextResponse.json(formatErrorEntity("Changelog not found"), {
          status: 404,
        });
      }

      logger.info({ changelogId: updatedChangelog.id }, "Successfully updated changelog likes");
      return NextResponse.json(formatEntity(updatedChangelog, "changelog"));
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "PUT /api/changelogs/[id]");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error in PUT /api/changelogs/[id]"
      );
      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "PUT /api/changelogs/[id]" }
);
