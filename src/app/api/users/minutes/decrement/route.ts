import * as Sentry from "@sentry/nextjs";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { db } from "~/db";
import { statistics, users } from "~/db/schema";
import { logger } from "~/lib/logger";

export const PUT = withAuth(
  async (_request, { user }) => {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({
          minutes: sql`GREATEST(${users.minutes} - 1, 0)`,
        })
        .where(eq(users.id, user.id))
        .returning();

      await db
        .update(statistics)
        .set({
          minutesCount: sql`${statistics.minutesCount} + 1`,
        })
        .where(eq(statistics.id, 1));

      if (!updatedUser) {
        logger.warn({ userId: user.id }, "Failed to decrement user minutes");
        return NextResponse.json(formatErrorEntity("Failed to decrement user minutes"), {
          status: 500,
        });
      }

      logger.info(
        { userId: user.id, minutes: updatedUser.minutes },
        "Successfully decremented user minutes"
      );
      return NextResponse.json(formatEntity(updatedUser, "user"));
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "PUT /api/users/minutes/decrement");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error in PUT /api/users/minutes/decrement"
      );
      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "PUT /api/users/minutes/decrement" }
);
