import { db } from "@/db";
import { invitations, organizationMembers } from "@/db/schema";
import { getUserFromClerkId } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const invitationId = idHandler.decode(params.id);
  logger.info("PUT request received at /api/invitations/[id]", {
    invitationId,
  });

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.error("Unauthorized access attempt at /api/invitations/[id]");
    return NextResponse.json(formatErrorEntity({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const user = await getUserFromClerkId(clerkUserId);
    if (!user || !user.id || !user.email) {
      logger.error("User not found", { clerkUserId });
      return NextResponse.json(
        formatErrorEntity({ message: "User not found" }),
        { status: 404 }
      );
    }

    const data = await request.json();
    const { status } = data;

    if (!status) {
      return NextResponse.json(
        formatErrorEntity({ message: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Get the invitation
    const invitation = await db.query.invitations.findFirst({
      where: and(
        eq(invitations.id, invitationId),
        eq(invitations.isDeleted, false)
      ),
    });

    if (!invitation) {
      logger.error("Invitation not found", { invitationId });
      return NextResponse.json(
        formatErrorEntity({ message: "Invitation not found" }),
        { status: 404 }
      );
    }

    // If accepting invitation, add user to organization
    if (status === "accepted") {
      // Check if user is already a member
      const existingMember = await db.query.organizationMembers.findFirst({
        where: and(
          eq(organizationMembers.organizationId, invitation.organizationId),
          eq(organizationMembers.userId, user.id)
        ),
      });

      if (existingMember) {
        return NextResponse.json(
          formatErrorEntity({ message: "User is already a member" }),
          { status: 400 }
        );
      }

      // Add user to organization with member role
      await db.insert(organizationMembers).values({
        organizationId: invitation.organizationId,
        userId: user.id,
        role: "member",
        isActive: true,
      });
    }

    // Update invitation status
    const [updatedInvitation] = await db
      .update(invitations)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(invitations.id, invitationId))
      .returning();

    return NextResponse.json(formatEntity(updatedInvitation, "invitation"));
  } catch (error) {
    logger.error("Error updating invitation", { error });
    Sentry.captureException(error);
    return NextResponse.json(
      formatErrorEntity({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}
