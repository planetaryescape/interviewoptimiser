import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
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

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  logger.info("GET request received at /api/organizations/[id]", {
    id: params.id,
  });

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.error("Unauthorized access attempt at /api/organizations/[id]");
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
    const member = await checkOrganizationAccess(organizationId, user.id);
    if (!member) {
      logger.error("User not authorized to access organization", {
        userId: user.id,
        organizationId,
      });
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
      logger.error("Organization not found", { organizationId });
      return NextResponse.json(formatErrorEntity({ message: "Organization not found" }), {
        status: 404,
      });
    }

    logger.info("Successfully fetched organization", {
      userId: user.id,
      organizationId,
    });

    return NextResponse.json(formatEntity(organization, "organization"));
  } catch (error) {
    logger.error("Error fetching organization", { error });
    Sentry.captureException(error);
    return NextResponse.json(formatErrorEntity(error), { status: 500 });
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  logger.info("PUT request received at /api/organizations/[id]", {
    id: params.id,
  });

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.error("Unauthorized access attempt at /api/organizations/[id]");
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
    const member = await checkOrganizationAccess(organizationId, user.id);
    if (!member || !["owner", "admin"].includes(member.role)) {
      logger.error("User not authorized to update organization", {
        userId: user.id,
        organizationId,
        role: member?.role,
      });
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
      logger.error("Missing required fields", { json });
      return NextResponse.json(formatErrorEntity({ message: "Name is required" }), { status: 400 });
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

    logger.info("Successfully updated organization", {
      userId: user.id,
      organizationId,
    });

    return NextResponse.json(formatEntity(organization, "organization"));
  } catch (error) {
    logger.error("Error updating organization", { error });
    Sentry.captureException(error);
    return NextResponse.json(formatErrorEntity(error), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  logger.info("DELETE request received at /api/organizations/[id]", {
    id: params.id,
  });

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.error("Unauthorized access attempt at /api/organizations/[id]");
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
    const member = await checkOrganizationAccess(organizationId, user.id);
    if (!member || member.role !== "owner") {
      logger.error("User not authorized to delete organization", {
        userId: user.id,
        organizationId,
        role: member?.role,
      });
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

    logger.info("Successfully deleted organization", {
      userId: user.id,
      organizationId,
    });

    return NextResponse.json(formatEntity(organization, "organization"));
  } catch (error) {
    logger.error("Error deleting organization", { error });
    Sentry.captureException(error);
    return NextResponse.json(formatErrorEntity(error), { status: 500 });
  }
}
