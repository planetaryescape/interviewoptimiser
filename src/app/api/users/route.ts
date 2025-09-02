import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { CacheDurations, CachePrefixes, CacheTags, cache } from "@/lib/cache";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { db } from "~/db";
import { users } from "~/db/schema";
import { logger } from "~/lib/logger";

export const GET = withAuth(
  async (_request, { user }) => {
    try {
      const cacheKey = `user:${user.id}`;

      const userData = await cache.wrap(
        cacheKey,
        async () => {
          const data = await db.query.users.findFirst({
            where: eq(users.id, user.id),
            with: {
              customisation: true,
              organizationMemberships: true,
            },
          });

          if (!data) {
            return null;
          }

          return {
            ...data,
            organizationMemberships: data.organizationMemberships.map((membership) => ({
              organizationId: membership.organizationId,
              role: membership.role,
            })),
          };
        },
        {
          ttl: CacheDurations.MEDIUM,
          prefix: CachePrefixes.USER,
          tags: [CacheTags.USER_DATA, `user:${user.id}`],
        }
      );

      if (!userData) {
        logger.warn({ userId: user.id }, "User not found in database");
        return NextResponse.json(formatErrorEntity("User not found"), {
          status: 404,
        });
      }

      logger.info({ userId: user.id }, "Successfully retrieved user");
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
  },
  { routeName: "GET /api/users" }
);
