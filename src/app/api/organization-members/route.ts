import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { formatEntity, formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import { db } from "~/db";
import { organizationMembers } from "~/db/schema";
import { logger } from "~/lib/logger";

export const GET = withAuth(
  async (_request, { user }) => {
    try {
      if (!user || !user.id) {
        logger.error("User not found", { userId: user.id });
        return NextResponse.json(formatErrorEntity({ message: "User not found" }), { status: 404 });
      }

      const members = await db
        .select()
        .from(organizationMembers)
        .where(eq(organizationMembers.userId, user.id));

      return NextResponse.json(formatEntityList(members, "organization-member"));
    } catch (error) {
      logger.error("Error fetching organization members", { error });
      Sentry.withScope((scope) => {
        scope.setExtra("context", "getOrganizationMembers");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      return NextResponse.json(formatErrorEntity({ message: "Internal server error" }), {
        status: 500,
      });
    }
  },
  { routeName: "GET /api/organization-members" }
);

export const POST = withAuth(
  async (request, { user }) => {
    try {
      if (!user || !user.id) {
        logger.error("User not found", { userId: user.id });
        return NextResponse.json(formatErrorEntity({ message: "User not found" }), { status: 404 });
      }

      const data = await request.json();
      const { organizationId, role } = data;

      if (!organizationId || !role) {
        return NextResponse.json(formatErrorEntity({ message: "Missing required fields" }), {
          status: 400,
        });
      }

      const member = await db
        .insert(organizationMembers)
        .values({
          organizationId,
          userId: user.id,
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return NextResponse.json(formatEntity(member[0], "organization-member"));
    } catch (error) {
      logger.error("Error creating organization member", { error });
      Sentry.withScope((scope) => {
        scope.setExtra("context", "createOrganizationMember");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      return NextResponse.json(formatErrorEntity({ message: "Internal server error" }), {
        status: 500,
      });
    }
  },
  { routeName: "POST /api/organization-members" }
);
