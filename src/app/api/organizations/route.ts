import { withAuth } from "@/lib/auth-middleware";
import { encodeOrganization } from "@/lib/utils/encodeHelpers";
import { formatEntity, formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/db";
import { organizationMembers, organizations } from "~/db/schema";
import { logger } from "~/lib/logger";

export const GET = withAuth(
  async (_request, { user }) => {
    try {
      if (!user || !user.id) {
        logger.error({ userId: user?.id }, "User not found");
        return NextResponse.json(formatErrorEntity({ message: "User not found" }), { status: 404 });
      }

      const userOrganizations = await db
        .select({
          id: organizations.id,
          name: organizations.name,
          description: organizations.description,
          website: organizations.website,
          industry: organizations.industry,
          size: organizations.size,
          createdAt: organizations.createdAt,
          updatedAt: organizations.updatedAt,
          role: organizationMembers.role,
        })
        .from(organizations)
        .innerJoin(
          organizationMembers,
          and(
            eq(organizationMembers.organizationId, organizations.id),
            eq(organizationMembers.userId, user.id)
          )
        )
        .where(eq(organizations.isDeleted, false));

      // Encode all IDs before sending to client
      const encodedOrganizations = userOrganizations.map((org) => ({
        ...org,
        id: idHandler.encode(org.id),
      }));

      return NextResponse.json(formatEntityList(encodedOrganizations, "organization"));
    } catch (error) {
      logger.error({ error }, "Error fetching organizations");
      Sentry.withScope((scope) => {
        scope.setExtra("context", "getOrganizations");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      return NextResponse.json(formatErrorEntity({ message: "Internal server error" }), {
        status: 500,
      });
    }
  },
  { routeName: "GET /api/organizations" }
);

export const POST = withAuth(
  async (request, { user }) => {
    try {
      if (!user || !user.id) {
        logger.error({ userId: user?.id }, "User not found");
        return NextResponse.json(formatErrorEntity({ message: "User not found" }), { status: 404 });
      }

      const data = await request.json();

      // Create organization and add creator as owner in a transaction
      const result = await db.transaction(async (tx) => {
        const [organization] = await tx
          .insert(organizations)
          .values({
            ...data,
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        const [member] = await tx
          .insert(organizationMembers)
          .values({
            organizationId: organization.id,
            userId: user.id,
            role: "owner",
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return { organization, member };
      });

      // Encode IDs before sending to client
      const encodedOrganization = {
        ...result.organization,
        id: idHandler.encode(result.organization.id),
        role: result.member.role,
      };

      return NextResponse.json(formatEntity(encodedOrganization, "organization"));
    } catch (error) {
      logger.error({ error }, "Error creating organization");
      Sentry.withScope((scope) => {
        scope.setExtra("context", "createOrganization");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      return NextResponse.json(formatErrorEntity({ message: "Internal server error" }), {
        status: 500,
      });
    }
  },
  { routeName: "POST /api/organizations" }
);
