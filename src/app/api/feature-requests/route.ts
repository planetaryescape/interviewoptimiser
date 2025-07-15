import { withAuth } from "@/lib/auth-middleware";
import { formatEntity, formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import * as Sentry from "@sentry/nextjs";
import { desc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/db";
import { featureRequestLikes, featureRequests, users } from "~/db/schema";
import { logger } from "~/lib/logger";

export const GET = withAuth(
  async (request, { user }) => {
    try {
      const isAdmin = user.role === "admin";
      const currentUserId = user.id;

      const featureRequestsWithLikes = await db
        .select({
          id: featureRequests.id,
          title: featureRequests.title,
          content: featureRequests.content,
          status: featureRequests.status,
          userId: featureRequests.userId,
          createdAt: featureRequests.createdAt,
          updatedAt: featureRequests.updatedAt,
          likesCount: sql<number>`count(${featureRequestLikes.id})`.as("likes_count"),
          ...(isAdmin ? { username: users.username } : {}),
          hasVoted: currentUserId
            ? sql<boolean>`EXISTS (
          SELECT 1 FROM ${featureRequestLikes}
          WHERE ${featureRequestLikes.featureRequestId} = ${featureRequests.id}
          AND ${featureRequestLikes.userId} = ${currentUserId})`.as("has_voted")
            : sql<boolean>`false`.as("has_voted"),
        })
        .from(featureRequests)
        .leftJoin(
          featureRequestLikes,
          sql`${featureRequests.id} = ${featureRequestLikes.featureRequestId}`
        )
        .leftJoin(users, sql`${featureRequests.userId} = ${users.id}`)
        .groupBy(featureRequests.id, ...(isAdmin ? [users.username] : []))
        .orderBy(desc(sql`likes_count`));

      logger.info("Successfully retrieved feature requests");
      return NextResponse.json(formatEntityList(featureRequestsWithLikes, "feature-request"));
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "GET /api/feature-requests");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error in GET /api/feature-requests"
      );
      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "GET /api/feature-requests" }
);

export const POST = withAuth(
  async (request, { user }) => {
    try {
      const body = await request.json();
      logger.info({ body }, "Received feature request data");
      const { title, content } = body;

      const [newFeatureRequest] = await db
        .insert(featureRequests)
        .values({
          title: title?.trim(),
          content: content?.trim(),
          userId: user.id,
        })
        .returning();

      logger.info(
        { featureRequestId: newFeatureRequest.id },
        "Successfully created new feature request"
      );
      return NextResponse.json(formatEntity(newFeatureRequest, "feature-request"));
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "POST /api/feature-requests");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error in POST /api/feature-requests"
      );
      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "POST /api/feature-requests" }
);
