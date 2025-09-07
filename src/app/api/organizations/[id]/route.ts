import { withAuth } from "@/lib/auth-middleware";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/db";
import { organizationMembers, organizations } from "~/db/schema";
import { logger } from "~/lib/logger";

async function checkOrganizationAccess(organizationId: number, userId: number) {
  const member = await db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.organizationId, organizationId),
      eq(organizationMembers.userId, userId),
      eq(organizationMembers.isActive, true)
    ),
  });
  return member;
}

export const GET = withAuth<{ id: string }>(
  async (_request, { user, params }) => {
    try {
      if (!user || !user.id) {
        logger.error({ userId: user.id }, "User not found");
        return NextResponse.json(formatErrorEntity({ message: "User not found" }), { status: 404 });
      }

      const organizationId = idHandler.decode(params!.id);
      const member = await checkOrganizationAccess(organizationId, user.id);
      if (!member) {
        logger.error(
          {
            userId: user.id,
            organizationId,
          },
          "User not authorized to access organization"
        );
        return NextResponse.json(
          formatErrorEntity({
            message: "Not authorized to access this organization",
          }),
          { status: 403 }
        );
      }

      const organization = await db.query.organizations.findFirst({
        where: and(eq(organizations.id, organizationId), eq(organizations.isDeleted, false)),
      });

      if (!organization) {
        logger.error({ organizationId }, "Organization not found");
        return NextResponse.json(formatErrorEntity({ message: "Organization not found" }), {
          status: 404,
        });
      }

      logger.info(
        {
          userId: user.id,
          organizationId,
        },
        "Successfully fetched organization"
      );

      return NextResponse.json(formatEntity(organization, "organization"));
    } catch (error) {
      logger.error({ error }, "Error fetching organization");
      Sentry.captureException(error);
      return NextResponse.json(formatErrorEntity(error), { status: 500 });
    }
  },
  { routeName: "GET /api/organizations/[id]" }
);

export const PUT = withAuth<{ id: string }>(
  async (request, { user, params }) => {
    try {
      if (!user || !user.id) {
        logger.error({ userId: user.id }, "User not found");
        return NextResponse.json(formatErrorEntity({ message: "User not found" }), { status: 404 });
      }

      const organizationId = idHandler.decode(params!.id);
      const member = await checkOrganizationAccess(organizationId, user.id);
      if (!member || !["owner", "admin"].includes(member.role)) {
        logger.error(
          {
            userId: user.id,
            organizationId,
            role: member?.role,
          },
          "User not authorized to update organization"
        );
        return NextResponse.json(
          formatErrorEntity({
            message: "Not authorized to update this organization",
          }),
          { status: 403 }
        );
      }

      const json = await request.json();
      const { name, description, website, industry, size } = json;

      if (!name) {
        logger.error({ json }, "Missing required fields");
        return NextResponse.json(formatErrorEntity({ message: "Name is required" }), {
          status: 400,
        });
      }

      const [organization] = await db
        .update(organizations)
        .set({
          name,
          description,
          website,
          industry,
          size,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, organizationId))
        .returning();

      logger.info(
        {
          userId: user.id,
          organizationId,
        },
        "Successfully updated organization"
      );

      return NextResponse.json(formatEntity(organization, "organization"));
    } catch (error) {
      logger.error({ error }, "Error updating organization");
      Sentry.captureException(error);
      return NextResponse.json(formatErrorEntity(error), { status: 500 });
    }
  },
  { routeName: "PUT /api/organizations/[id]" }
);

export const DELETE = withAuth<{ id: string }>(
  async (_request, { user, params }) => {
    try {
      if (!user || !user.id) {
        logger.error({ userId: user.id }, "User not found");
        return NextResponse.json(formatErrorEntity({ message: "User not found" }), { status: 404 });
      }

      const organizationId = idHandler.decode(params!.id);
      const member = await checkOrganizationAccess(organizationId, user.id);
      if (!member || member.role !== "owner") {
        logger.error(
          {
            userId: user.id,
            organizationId,
            role: member?.role,
          },
          "User not authorized to delete organization"
        );
        return NextResponse.json(
          formatErrorEntity({
            message: "Not authorized to delete this organization",
          }),
          { status: 403 }
        );
      }

      const [organization] = await db
        .update(organizations)
        .set({
          isDeleted: true,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, organizationId))
        .returning();

      logger.info(
        {
          userId: user.id,
          organizationId,
        },
        "Successfully deleted organization"
      );

      return NextResponse.json(formatEntity(organization, "organization"));
    } catch (error) {
      logger.error({ error }, "Error deleting organization");
      Sentry.captureException(error);
      return NextResponse.json(formatErrorEntity(error), { status: 500 });
    }
  },
  { routeName: "DELETE /api/organizations/[id]" }
);
