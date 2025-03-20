import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatEntityList, formatErrorEntity } from "@/lib/utils/formatEntity";
import { getAuth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { organizationMembers } from "~/db/schema";
import { logger } from "~/lib/logger";

export async function GET(request: NextRequest) {
  logger.info("GET request received at /api/organization-members");

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.error("Unauthorized access attempt at /api/organization-members");
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
}

export async function POST(request: NextRequest) {
  logger.info("POST request received at /api/organization-members");

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    logger.error("Unauthorized access attempt at /api/organization-members");
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
}
