import { withAuth } from "@/lib/auth-middleware";
import { encodeOrganizationMember } from "@/lib/utils/encodeHelpers";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/db";
import { organizationMembers } from "~/db/schema";
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

export const PUT = withAuth<{ id: string; memberId: string }>(
  async (request, { user, params }) => {
    try {
      if (!user || !user.id) {
        logger.error({ userId: user.id }, "User not found");
        return NextResponse.json(formatErrorEntity({ message: "User not found" }), { status: 404 });
      }

      // Decode hash IDs to numeric
      const organizationId = idHandler.safeDecode(params!.id);
      if (organizationId === null) {
        return NextResponse.json(formatErrorEntity({ message: "Invalid organization ID" }), {
          status: 404,
        });
      }

      const memberId = idHandler.safeDecode(params!.memberId);
      if (memberId === null) {
        return NextResponse.json(formatErrorEntity({ message: "Invalid member ID" }), {
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
          "User not authorized to update organization members"
        );
        return NextResponse.json(
          formatErrorEntity({
            message: "Not authorized to update members in this organization",
          }),
          { status: 403 }
        );
      }

      const targetMember = await db.query.organizationMembers.findFirst({
        where: and(
          eq(organizationMembers.id, memberId),
          eq(organizationMembers.organizationId, organizationId)
        ),
      });

      if (!targetMember) {
        logger.error({ memberId, organizationId }, "Member not found");
        return NextResponse.json(formatErrorEntity({ message: "Member not found" }), {
          status: 404,
        });
      }

      const json = await request.json();
      const { role } = json;

      // Owner role can only be changed by the current owner
      if ((targetMember.role === "owner" || json.role === "owner") && member.role !== "owner") {
        logger.error(
          {
            userId: user.id,
            organizationId,
            memberId,
          },
          "Only owners can modify owner role"
        );
        return NextResponse.json(
          formatErrorEntity({
            message: "Only owners can modify the owner role",
          }),
          { status: 403 }
        );
      }

      if (!role) {
        logger.error({ json }, "Missing required fields");
        return NextResponse.json(formatErrorEntity({ message: "Role is required" }), {
          status: 400,
        });
      }

      if (!["owner", "admin", "member"].includes(role)) {
        logger.error({ role }, "Invalid role");
        return NextResponse.json(
          formatErrorEntity({
            message: "Invalid role. Must be 'owner', 'admin', or 'member'",
          }),
          { status: 400 }
        );
      }

      // If changing owner, do it in a transaction to ensure there's always exactly one owner
      if (role === "owner" || targetMember.role === "owner") {
        const [updatedMember] = await db.transaction(async (tx) => {
          if (role === "owner") {
            // Remove owner role from current owner
            await tx
              .update(organizationMembers)
              .set({
                role: "admin",
                updatedAt: new Date(),
              })
              .where(
                and(
                  eq(organizationMembers.organizationId, organizationId),
                  eq(organizationMembers.role, "owner")
                )
              );
          }

          // Update target member's role
          const [member] = await tx
            .update(organizationMembers)
            .set({
              role,
              updatedAt: new Date(),
            })
            .where(eq(organizationMembers.id, memberId))
            .returning();

          return [member];
        });

        logger.info(
          {
            userId: user.id,
            organizationId,
            memberId,
            oldRole: targetMember.role,
            newRole: role,
          },
          "Successfully updated organization member role"
        );

        // Encode IDs before sending to client
        const encodedUpdatedMember = encodeOrganizationMember(updatedMember);
        return NextResponse.json(formatEntity(encodedUpdatedMember, "organization-member"));
      }

      // For non-owner role changes
      const [updatedMember] = await db
        .update(organizationMembers)
        .set({
          role,
          updatedAt: new Date(),
        })
        .where(eq(organizationMembers.id, memberId))
        .returning();

      logger.info(
        {
          userId: user.id,
          organizationId,
          memberId,
          oldRole: targetMember.role,
          newRole: role,
        },
        "Successfully updated organization member role"
      );

      // Encode IDs before sending to client
      const encodedUpdatedMember = encodeOrganizationMember(updatedMember);
      return NextResponse.json(formatEntity(encodedUpdatedMember, "organization-member"));
    } catch (error) {
      logger.error({ error }, "Error updating organization member");
      Sentry.captureException(error);
      return NextResponse.json(formatErrorEntity(error), { status: 500 });
    }
  },
  { routeName: "PUT /api/organizations/[id]/members/[memberId]" }
);

export const DELETE = withAuth<{ id: string; memberId: string }>(
  async (_request, { user, params }) => {
    try {
      if (!user || !user.id) {
        logger.error({ userId: user.id }, "User not found");
        return NextResponse.json(formatErrorEntity({ message: "User not found" }), { status: 404 });
      }

      // Decode hash IDs to numeric
      const organizationId = idHandler.safeDecode(params!.id);
      if (organizationId === null) {
        return NextResponse.json(formatErrorEntity({ message: "Invalid organization ID" }), {
          status: 404,
        });
      }

      const memberId = idHandler.safeDecode(params!.memberId);
      if (memberId === null) {
        return NextResponse.json(formatErrorEntity({ message: "Invalid member ID" }), {
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
          "User not authorized to remove organization members"
        );
        return NextResponse.json(
          formatErrorEntity({
            message: "Not authorized to remove members from this organization",
          }),
          { status: 403 }
        );
      }

      const targetMember = await db.query.organizationMembers.findFirst({
        where: and(
          eq(organizationMembers.id, memberId),
          eq(organizationMembers.organizationId, organizationId)
        ),
      });

      if (!targetMember) {
        logger.error({ memberId, organizationId }, "Member not found");
        return NextResponse.json(formatErrorEntity({ message: "Member not found" }), {
          status: 404,
        });
      }

      // Cannot remove the owner
      if (targetMember.role === "owner") {
        logger.error(
          {
            userId: user.id,
            organizationId,
            memberId,
          },
          "Cannot remove organization owner"
        );
        return NextResponse.json(
          formatErrorEntity({ message: "Cannot remove the organization owner" }),
          { status: 403 }
        );
      }

      // Soft delete by setting isActive to false
      const [updatedMember] = await db
        .update(organizationMembers)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(organizationMembers.id, memberId))
        .returning();

      logger.info(
        {
          userId: user.id,
          organizationId,
          memberId,
        },
        "Successfully removed organization member"
      );

      // Encode IDs before sending to client
      const encodedUpdatedMember = encodeOrganizationMember(updatedMember);
      return NextResponse.json(formatEntity(encodedUpdatedMember, "organization-member"));
    } catch (error) {
      logger.error({ error }, "Error removing organization member");
      Sentry.captureException(error);
      return NextResponse.json(formatErrorEntity(error), { status: 500 });
    }
  },
  { routeName: "DELETE /api/organizations/[id]/members/[memberId]" }
);
