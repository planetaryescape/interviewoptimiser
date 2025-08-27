import { withAuth } from "@/lib/auth-middleware";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/db";
import { users } from "~/db/schema";
import { logger } from "~/lib/logger";

export const GET = withAuth(
  async (_request, { user }) => {
    try {
      const userData = await db.query.users.findFirst({
        where: eq(users.id, user.id),
        with: {
          customisation: true,
          organizationMemberships: true,
        },
      });

      if (!userData) {
        logger.warn({ userId: user.id }, "User not found in database");
        return NextResponse.json(formatErrorEntity("User not found"), {
          status: 404,
        });
      }

      // Transform the data to include organization memberships
      const transformedUserData = {
        ...userData,
        organizationMemberships: userData.organizationMemberships.map((membership) => ({
          organizationId: membership.organizationId,
          role: membership.role,
        })),
      };

      logger.info({ userId: user.id }, "Successfully retrieved user");
      return NextResponse.json(formatEntity(transformedUserData, "user"));
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
  },
  { routeName: "GET /api/users" }
);
