import { InvitationEmail } from "@/emails/invitation";
import { getUserFromClerkId, getUserFromEmail } from "@/lib/auth";
import { formatEntity, formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { addDays, format, isPast } from "date-fns";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { config } from "~/config";
import { db } from "~/db";
import { invitations, organizationMembers } from "~/db/schema";
import { logger } from "~/lib/logger";
import { resend } from "~/lib/resend";

// 7 days expiration
const INVITATION_EXPIRY_DAYS = 7;

export async function GET(request: NextRequest) {
  logger.info("GET request received at /api/invitations");

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.error("Unauthorized access attempt at /api/invitations");
    return NextResponse.json(formatErrorEntity({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const user = await getUserFromClerkId(clerkUserId);
    if (!user || !user.id || !user.email) {
      logger.error("User not found", { clerkUserId });
      return NextResponse.json(formatErrorEntity({ message: "User not found" }), { status: 404 });
    }

    const url = new URL(request.url);

    const organizationId = Number.parseInt(url.searchParams.get("organizationId") ?? "");

    const userInvitations = await db
      .select()
      .from(invitations)
      .where(and(eq(invitations.organizationId, organizationId), eq(invitations.isDeleted, false)));

    return NextResponse.json(formatEntityList(userInvitations, "invitation"));
  } catch (error) {
    logger.error("Error fetching invitations", {
      error,
      message: error instanceof Error ? error.message : "",
    });
    Sentry.withScope((scope) => {
      scope.setExtra("context", "getInvitations");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    return NextResponse.json(formatErrorEntity({ message: "Internal server error" }), {
      status: 500,
    });
  }
}

export async function POST(request: NextRequest) {
  logger.info("POST request received at /api/invitations");

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.error("Unauthorized access attempt at /api/invitations");
    return NextResponse.json(formatErrorEntity({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const user = await getUserFromClerkId(clerkUserId);
    if (!user || !user.id || !user.email) {
      logger.error("User not found", { clerkUserId });
      return NextResponse.json(formatErrorEntity({ message: "User not found" }), { status: 404 });
    }

    const data = await request.json();
    const { email, organizationId, organizationName } = data;

    if (!email || !organizationId) {
      return NextResponse.json(formatErrorEntity({ message: "Missing required fields" }), {
        status: 400,
      });
    }

    const userToAdd = await getUserFromEmail(email);

    // Check if user is already a member
    const existingMember = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userToAdd?.id ?? 0)
        )
      );

    if (existingMember.length > 0) {
      return NextResponse.json(formatErrorEntity({ message: "User is already a member" }), {
        status: 400,
      });
    }

    // Check for existing pending invitation
    const existingInvitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.organizationId, organizationId),
          eq(invitations.email, email),
          eq(invitations.status, "pending"),
          eq(invitations.isDeleted, false)
        )
      );

    if (existingInvitation.length > 0) {
      return NextResponse.json(formatErrorEntity({ message: "Invitation already exists" }), {
        status: 400,
      });
    }

    const expiresAt = addDays(new Date(), INVITATION_EXPIRY_DAYS);

    const [invitation] = await db
      .insert(invitations)
      .values({
        email,
        organizationId,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Send invitation email
    const invitationLink = `${config.baseUrl}/invitations/${invitation.id}`;
    const formattedExpiresAt = format(invitation.expiresAt, "MMMM d, yyyy");

    await resend.emails.send({
      from: "Interview Optimizer <no-reply@interviewoptimizer.com>",
      to: email,
      subject: `Invitation to join ${organizationName} on Interview Optimizer`,
      react: InvitationEmail({
        invitationLink,
        organizationName,
        expiresAt: formattedExpiresAt,
      }),
    });

    return NextResponse.json(formatEntity(invitation, "invitation"));
  } catch (error) {
    logger.error("Error creating invitation", { error });
    Sentry.withScope((scope) => {
      scope.setExtra("context", "createInvitation");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    return NextResponse.json(formatErrorEntity({ message: "Internal server error" }), {
      status: 500,
    });
  }
}

export async function PUT(request: NextRequest) {
  logger.info("PUT request received at /api/invitations");

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.error("Unauthorized access attempt at /api/invitations");
    return NextResponse.json(formatErrorEntity({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const user = await getUserFromClerkId(clerkUserId);
    if (!user || !user.id || !user.email) {
      logger.error("User not found", { clerkUserId });
      return NextResponse.json(formatErrorEntity({ message: "User not found" }), { status: 404 });
    }

    const data = await request.json();
    const { status, invitationId } = data;

    if (!invitationId || !status) {
      return NextResponse.json(formatErrorEntity({ message: "Missing required fields" }), {
        status: 400,
      });
    }

    const invitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, invitationId),
          eq(invitations.email, user.email),
          eq(invitations.status, "pending"),
          eq(invitations.isDeleted, false)
        )
      );

    if (invitation.length === 0) {
      return NextResponse.json(formatErrorEntity({ message: "Invalid invitation" }), {
        status: 404,
      });
    }

    if (isPast(invitation[0].expiresAt)) {
      const [updatedInvitation] = await db
        .update(invitations)
        .set({ status: "expired", updatedAt: new Date() })
        .where(eq(invitations.id, invitationId))
        .returning();

      return NextResponse.json(formatEntity(updatedInvitation, "invitation"));
    }

    const result = await db.transaction(async (tx) => {
      const [updatedInvitation] = await tx
        .update(invitations)
        .set({ status, updatedAt: new Date() })
        .where(eq(invitations.id, invitationId))
        .returning();

      if (status === "accepted") {
        const [member] = await tx
          .insert(organizationMembers)
          .values({
            organizationId: invitation[0].organizationId,
            userId: user.id,
            role: "member",
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return { invitation: updatedInvitation, member };
      }

      return { invitation: updatedInvitation };
    });

    return NextResponse.json(formatEntity(result.invitation, "invitation"));
  } catch (error) {
    logger.error("Error updating invitation", { error });
    Sentry.withScope((scope) => {
      scope.setExtra("context", "updateInvitation");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    return NextResponse.json(formatErrorEntity({ message: "Internal server error" }), {
      status: 500,
    });
  }
}
