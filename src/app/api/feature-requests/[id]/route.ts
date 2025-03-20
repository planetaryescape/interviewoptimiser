import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { and, eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { featureRequestLikes, featureRequests } from "~/db/schema";
import { logger } from "~/lib/logger";

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  logger.info("POST request received at /api/feature-requests/[id]");
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.warn("Unauthorized access attempt to POST /api/feature-requests/[id]");
    return NextResponse.json(formatErrorEntity("Unauthorized"), {
      status: 401,
    });
  }

  const user = await getUserFromClerkId(clerkUserId);
  if (!user) {
    logger.warn("User not found for clerk ID", { clerkUserId });
    return NextResponse.json(formatErrorEntity("User not found"), {
      status: 404,
    });
  }

  const featureRequestId = idHandler.decode(params.id);

  try {
    const updatedFeatureRequest = await db.transaction(async (tx) => {
      const existingLike = await tx
        .select()
        .from(featureRequestLikes)
        .where(
          and(
            eq(featureRequestLikes.userId, user.id ?? 0),
            eq(featureRequestLikes.featureRequestId, featureRequestId)
          )
        )
        .limit(1);

      if (existingLike.length > 0) {
        // Unlike
        await tx.delete(featureRequestLikes).where(eq(featureRequestLikes.id, existingLike[0].id));
      } else {
        // Like
        await tx.insert(featureRequestLikes).values({
          userId: user.id ?? 0,
          featureRequestId: featureRequestId,
        });
      }

      const body = await request.json();
      const status = body.status;

      if (status) {
        await tx
          .update(featureRequests)
          .set({ status })
          .where(eq(featureRequests.id, featureRequestId));
      }

      const updatedFeatureRequest = await tx
        .select({
          id: featureRequests.id,
          title: featureRequests.title,
          content: featureRequests.content,
          status: featureRequests.status,
          createdAt: featureRequests.createdAt,
          likesCount: sql<number>`count(${featureRequestLikes.id})`.as("likes_count"),
        })
        .from(featureRequests)
        .leftJoin(
          featureRequestLikes,
          sql`${featureRequests.id} = ${featureRequestLikes.featureRequestId}`
        )
        .where(eq(featureRequests.id, featureRequestId))
        .groupBy(featureRequests.id)
        .limit(1);

      return updatedFeatureRequest[0];
    });

    if (!updatedFeatureRequest) {
      return NextResponse.json(formatErrorEntity("Feature request not found"), {
        status: 404,
      });
    }

    logger.info(
      { featureRequestId: updatedFeatureRequest.id },
      "Successfully updated feature request likes"
    );
    return NextResponse.json(formatEntity(updatedFeatureRequest, "feature-request"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "PUT /api/feature-requests/[id]");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in POST /api/feature-requests/[id]"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}
