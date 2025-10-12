import { withAuth } from "@/lib/auth-middleware";
import { encodeOrganizationMember } from "@/lib/utils/encodeHelpers";
import { formatEntity, formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/db";
import { organizationMembers, users } from "~/db/schema";
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

      // Decode hash ID to numeric
      const organizationId = idHandler.safeDecode(params!.id);
      if (organizationId === null) {
        return NextResponse.json(formatErrorEntity({ message: "Invalid organization ID" }), {
          status: 404,
        });
      }

      const member = await checkOrganizationAccess(organizationId, user.id);

      if (!member) {
        logger.error(
          {
            userId: user.id,
            organizationId,
          },
          "User not authorized to view organization members"
        );
        return NextResponse.json(
          formatErrorEntity({
            message: "Not authorized to view this organization's members",
          }),
          { status: 403 }
        );
      }

      const members = await db
        .select({
          id: organizationMembers.id,
          userId: organizationMembers.userId,
          organizationId: organizationMembers.organizationId,
          role: organizationMembers.role,
          isActive: organizationMembers.isActive,
          createdAt: organizationMembers.createdAt,
          updatedAt: organizationMembers.updatedAt,
          username: users.username,
          email: users.email,
          firstname: users.firstname,
          lastname: users.lastname,
        })
        .from(organizationMembers)
        .innerJoin(users, eq(organizationMembers.userId, users.id))
        .where(eq(organizationMembers.organizationId, organizationId));

      logger.info(
        {
          userId: user.id,
          organizationId,
          count: members.length,
        },
        "Successfully fetched organization members"
      );

      // Encode all IDs before sending to client
      const encodedMembers = members.map((m) => ({
        ...m,
        id: idHandler.encode(m.id),
        userId: idHandler.encode(m.userId),
        organizationId: idHandler.encode(m.organizationId),
      }));

      return NextResponse.json(formatEntityList(encodedMembers, "organization-member"));
    } catch (error) {
      logger.error({ error }, "Error fetching organization members");
      Sentry.captureException(error);
      return NextResponse.json(formatErrorEntity(error), { status: 500 });
    }
  },
  { routeName: "GET /api/organizations/[id]/members" }
);

export const POST = withAuth<{ id: string }>(
  async (request, { user, params }) => {
    try {
      if (!user || !user.id) {
        logger.error({ userId: user.id }, "User not found");
        return NextResponse.json(formatErrorEntity({ message: "User not found" }), { status: 404 });
      }

      // Decode hash ID to numeric
      const organizationId = idHandler.safeDecode(params!.id);
      if (organizationId === null) {
        return NextResponse.json(formatErrorEntity({ message: "Invalid organization ID" }), {
          status: 404,
        });
      }

      const member = await checkOrganizationAccess(organizationId, user.id);
      if (!member || !["owner", "admin"].includes(member.role)) {
        logger.error(
          {
            userId: user.id,
            organizationId,
            role: member?.role,
          },
          "User not authorized to add organization members"
        );
        return NextResponse.json(
          formatErrorEntity({
            message: "Not authorized to add members to this organization",
          }),
          { status: 403 }
        );
      }

      const json = await request.json();
      const { email, role } = json;

      if (!email || !role) {
        logger.error({ json }, "Missing required fields");
        return NextResponse.json(formatErrorEntity({ message: "Email and role are required" }), {
          status: 400,
        });
      }

      if (!["admin", "member"].includes(role)) {
        logger.error({ role }, "Invalid role");
        return NextResponse.json(
          formatErrorEntity({
            message: "Invalid role. Must be 'admin' or 'member'",
          }),
          { status: 400 }
        );
      }

      const newUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!newUser) {
        logger.error({ email }, "User not found");
        return NextResponse.json(formatErrorEntity({ message: "User not found" }), { status: 404 });
      }

      const existingMember = await db.query.organizationMembers.findFirst({
        where: and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, newUser.id)
        ),
      });

      if (existingMember) {
        if (existingMember.isActive) {
          logger.error({ email }, "User is already a member");
          return NextResponse.json(formatErrorEntity({ message: "User is already a member" }), {
            status: 400,
          });
        }

        // Reactivate membership
        const [updatedMember] = await db
          .update(organizationMembers)
          .set({
            isActive: true,
            role,
            updatedAt: new Date(),
          })
          .where(eq(organizationMembers.id, existingMember.id))
          .returning();

        logger.info(
          {
            userId: user.id,
            organizationId,
            memberId: updatedMember.id,
          },
          "Successfully reactivated organization member"
        );

        // Encode IDs before sending to client
        const encodedUpdatedMember = encodeOrganizationMember(updatedMember);
        return NextResponse.json(formatEntity(encodedUpdatedMember, "organization-member"));
      }

      const [newMember] = await db
        .insert(organizationMembers)
        .values({
          organizationId,
          userId: newUser.id,
          role,
        })
        .returning();

      logger.info(
        {
          userId: user.id,
          organizationId,
          memberId: newMember.id,
        },
        "Successfully added organization member"
      );

      // Encode IDs before sending to client
      const encodedNewMember = encodeOrganizationMember(newMember);
      return NextResponse.json(formatEntity(encodedNewMember, "organization-member"));
    } catch (error) {
      logger.error({ error }, "Error adding organization member");
      Sentry.captureException(error);
      return NextResponse.json(formatErrorEntity(error), { status: 500 });
    }
  },
  { routeName: "POST /api/organizations/[id]/members" }
);
