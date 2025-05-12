import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { statistics, users } from "~/db/schema";
import { logger } from "~/lib/logger";

export async function PUT(request: NextRequest) {
  logger.info("PUT request received at /api/users/minutes/decrement");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to PUT /api/users/minutes/decrement");
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

    const [updatedUser] = await db
      .update(users)
      .set({
        minutes: sql`GREATEST(${users.minutes} - 1, 0)`,
      })
      .where(eq(users.id, userId))
      .returning();

    await db
      .update(statistics)
      .set({
        minutesCount: sql`${statistics.minutesCount} + 1`,
      })
      .where(eq(statistics.id, 1));

    if (!updatedUser) {
      logger.warn({ userId }, "Failed to decrement user minutes");
      return NextResponse.json(formatErrorEntity("Failed to decrement user minutes"), {
        status: 500,
      });
    }

    logger.info({ userId, minutes: updatedUser.minutes }, "Successfully decremented user minutes");
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
}
