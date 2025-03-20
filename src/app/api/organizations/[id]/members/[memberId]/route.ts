import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
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

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string; memberId: string }> }
) {
  const params = await props.params;
  logger.info("PUT request received at /api/organizations/[id]/members/[memberId]", {
    id: params.id,
    memberId: params.memberId,
  });

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.error("Unauthorized access attempt at /api/organizations/[id]/members/[memberId]");
    return NextResponse.json(formatErrorEntity({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const user = await getUserFromClerkId(clerkUserId);
    if (!user || !user.id) {
      logger.error("User not found", { clerkUserId });
      return NextResponse.json(formatErrorEntity({ message: "User not found" }), { status: 404 });
    }

    const organizationId = idHandler.decode(params.id);
    const memberId = idHandler.decode(params.memberId);

    const member = await checkOrganizationAccess(organizationId, user.id);
    if (!member || !["owner", "admin"].includes(member.role)) {
      logger.error("User not authorized to update organization members", {
        userId: user.id,
        organizationId,
        role: member?.role,
      });
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
      logger.error("Member not found", { memberId, organizationId });
      return NextResponse.json(formatErrorEntity({ message: "Member not found" }), { status: 404 });
    }

    const json = await request.json();
    const { role } = json;

    // Owner role can only be changed by the current owner
    if ((targetMember.role === "owner" || json.role === "owner") && member.role !== "owner") {
      logger.error("Only owners can modify owner role", {
        userId: user.id,
        organizationId,
        memberId,
      });
      return NextResponse.json(
        formatErrorEntity({
          message: "Only owners can modify the owner role",
        }),
        { status: 403 }
      );
    }

    if (!role) {
      logger.error("Missing required fields", { json });
      return NextResponse.json(formatErrorEntity({ message: "Role is required" }), { status: 400 });
    }

    if (!["owner", "admin", "member"].includes(role)) {
      logger.error("Invalid role", { role });
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

      logger.info("Successfully updated organization member role", {
        userId: user.id,
        organizationId,
        memberId,
        oldRole: targetMember.role,
        newRole: role,
      });

      return NextResponse.json(formatEntity(updatedMember, "organization-member"));
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

    logger.info("Successfully updated organization member role", {
      userId: user.id,
      organizationId,
      memberId,
      oldRole: targetMember.role,
      newRole: role,
    });

    return NextResponse.json(formatEntity(updatedMember, "organization-member"));
  } catch (error) {
    logger.error("Error updating organization member", { error });
    Sentry.captureException(error);
    return NextResponse.json(formatErrorEntity(error), { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string; memberId: string }> }
) {
  const params = await props.params;
  logger.info("DELETE request received at /api/organizations/[id]/members/[memberId]", {
    id: params.id,
    memberId: params.memberId,
  });

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.error("Unauthorized access attempt at /api/organizations/[id]/members/[memberId]");
    return NextResponse.json(formatErrorEntity({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const user = await getUserFromClerkId(clerkUserId);
    if (!user || !user.id) {
      logger.error("User not found", { clerkUserId });
      return NextResponse.json(formatErrorEntity({ message: "User not found" }), { status: 404 });
    }

    const organizationId = idHandler.decode(params.id);
    const memberId = idHandler.decode(params.memberId);

    const member = await checkOrganizationAccess(organizationId, user.id);
    if (!member || !["owner", "admin"].includes(member.role)) {
      logger.error("User not authorized to remove organization members", {
        userId: user.id,
        organizationId,
        role: member?.role,
      });
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
      logger.error("Member not found", { memberId, organizationId });
      return NextResponse.json(formatErrorEntity({ message: "Member not found" }), { status: 404 });
    }

    // Cannot remove the owner
    if (targetMember.role === "owner") {
      logger.error("Cannot remove organization owner", {
        userId: user.id,
        organizationId,
        memberId,
      });
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

    logger.info("Successfully removed organization member", {
      userId: user.id,
      organizationId,
      memberId,
    });

    return NextResponse.json(formatEntity(updatedMember, "organization-member"));
  } catch (error) {
    logger.error("Error removing organization member", { error });
    Sentry.captureException(error);
    return NextResponse.json(formatErrorEntity(error), { status: 500 });
  }
}
