import { db } from "@/db";
import { organizationMembers, users } from "@/db/schema";
import { getUserFromClerkId } from "@/lib/auth";
import { logger } from "@/lib/logger";
import {
  formatEntity,
  formatEntityList,
  formatErrorEntity,
} from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

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

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  logger.info("GET request received at /api/organizations/[id]/members", {
    id: params.id,
  });

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.error(
      "Unauthorized access attempt at /api/organizations/[id]/members"
    );
    return NextResponse.json(formatErrorEntity({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const user = await getUserFromClerkId(clerkUserId);
    if (!user || !user.id) {
      logger.error("User not found", { clerkUserId });
      return NextResponse.json(
        formatErrorEntity({ message: "User not found" }),
        { status: 404 }
      );
    }

    const organizationId = idHandler.decode(params.id);
    const member = await checkOrganizationAccess(organizationId, user.id);

    if (!member) {
      logger.error("User not authorized to view organization members", {
        userId: user.id,
        organizationId,
      });
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

    logger.info("Successfully fetched organization members", {
      userId: user.id,
      organizationId,
      count: members.length,
    });

    return NextResponse.json(formatEntityList(members, "organization-member"));
  } catch (error) {
    logger.error("Error fetching organization members", { error });
    Sentry.captureException(error);
    return NextResponse.json(formatErrorEntity(error), { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  logger.info("POST request received at /api/organizations/[id]/members", {
    id: params.id,
  });

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.error(
      "Unauthorized access attempt at /api/organizations/[id]/members"
    );
    return NextResponse.json(formatErrorEntity({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const user = await getUserFromClerkId(clerkUserId);
    if (!user || !user.id) {
      logger.error("User not found", { clerkUserId });
      return NextResponse.json(
        formatErrorEntity({ message: "User not found" }),
        { status: 404 }
      );
    }

    const organizationId = idHandler.decode(params.id);
    const member = await checkOrganizationAccess(organizationId, user.id);
    if (!member || !["owner", "admin"].includes(member.role)) {
      logger.error("User not authorized to add organization members", {
        userId: user.id,
        organizationId,
        role: member?.role,
      });
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
      logger.error("Missing required fields", { json });
      return NextResponse.json(
        formatErrorEntity({ message: "Email and role are required" }),
        { status: 400 }
      );
    }

    if (!["admin", "member"].includes(role)) {
      logger.error("Invalid role", { role });
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
      logger.error("User not found", { email });
      return NextResponse.json(
        formatErrorEntity({ message: "User not found" }),
        { status: 404 }
      );
    }

    const existingMember = await db.query.organizationMembers.findFirst({
      where: and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, newUser.id)
      ),
    });

    if (existingMember) {
      if (existingMember.isActive) {
        logger.error("User is already a member", { email });
        return NextResponse.json(
          formatErrorEntity({ message: "User is already a member" }),
          { status: 400 }
        );
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

      logger.info("Successfully reactivated organization member", {
        userId: user.id,
        organizationId,
        memberId: updatedMember.id,
      });

      return NextResponse.json(
        formatEntity(updatedMember, "organization-member")
      );
    }

    const [newMember] = await db
      .insert(organizationMembers)
      .values({
        organizationId,
        userId: newUser.id,
        role,
      })
      .returning();

    logger.info("Successfully added organization member", {
      userId: user.id,
      organizationId,
      memberId: newMember.id,
    });

    return NextResponse.json(formatEntity(newMember, "organization-member"));
  } catch (error) {
    logger.error("Error adding organization member", { error });
    Sentry.captureException(error);
    return NextResponse.json(formatErrorEntity(error), { status: 500 });
  }
}
