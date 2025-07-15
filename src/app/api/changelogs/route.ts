import { withAuth } from "@/lib/auth-middleware";
import { formatEntity, formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import * as Sentry from "@sentry/nextjs";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/db";
import { changelogs } from "~/db/schema";
import { logger } from "~/lib/logger";

export async function GET() {
  logger.info("GET request received at /api/changelogs");

  try {
    const changelogEntries = await db.query.changelogs.findMany({
      orderBy: desc(changelogs.date),
    });

    logger.info({ count: changelogEntries.length }, "Successfully retrieved changelogs");
    return NextResponse.json(formatEntityList(changelogEntries, "changelog"));
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "GET /api/changelogs");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error in GET /api/changelogs"
    );
    return NextResponse.json(formatErrorEntity("Internal server error"), {
      status: 500,
    });
  }
}

export const POST = withAuth(
  async (request, { user }) => {
    try {
      const { role } = user;
      if (!user.id) {
        logger.warn({ userId: user.id }, "User not found in database");
        return NextResponse.json(formatErrorEntity("User not found"), {
          status: 404,
        });
      }

      // Check if the user is an admin
      if (role !== "admin") {
        logger.warn({ userId: user.id, role }, "Non-admin user attempted to create a changelog");
        return NextResponse.json(formatErrorEntity("Unauthorized: Admin access required"), {
          status: 403,
        });
      }

      const body = await request.json();
      logger.info({ body }, "Received changelog data");
      const { title, content } = body;

      const [newChangelog] = await db
        .insert(changelogs)
        .values({
          title: title?.trim(),
          content: content?.trim(),
        })
        .returning();

      logger.info({ changelogId: newChangelog.id }, "Successfully created new changelog");
      return NextResponse.json(formatEntity(newChangelog, "changelog"));
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "POST /api/changelogs");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error in POST /api/changelogs"
      );
      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "POST /api/changelogs" }
);
