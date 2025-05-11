import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { users } from "~/db/schema";
import { logger } from "~/lib/logger";

export async function GET(request: NextRequest) {
  logger.info("GET request received at /api/users");

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to GET /api/users");
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

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        customisation: true,
        organizationMemberships: true,
      },
    });

    if (!user) {
      logger.warn({ userId }, "User not found in database");
      return NextResponse.json(formatErrorEntity("User not found"), {
        status: 404,
      });
    }

    // Transform the data to include organization memberships
    const userData = {
      ...user,
      organizationMemberships: user.organizationMemberships.map((membership) => ({
        organizationId: membership.organizationId,
        role: membership.role,
      })),
    };

    logger.info({ user: user.id }, "Successfully retrieved user");
    return NextResponse.json(formatEntity(userData, "user"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/users");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/users"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
