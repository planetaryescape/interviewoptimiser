import { getReturningUserStats } from "@/lib/analytics/returning-users";
import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { getAuth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { logger } from "~/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = getAuth(request);

    if (!clerkUserId) {
      return NextResponse.json(formatErrorEntity("Authentication required"), { status: 401 });
    }

    const user = await getUserFromClerkId(clerkUserId);

    // Only allow admins to access this endpoint
    if (user.role !== "admin") {
      return NextResponse.json(formatErrorEntity("Unauthorized - Admin access required"), {
        status: 403,
      });
    }

    const stats = await getReturningUserStats();

    logger.info({ stats }, "Returning user analytics fetched");

    return NextResponse.json(formatEntity(stats, "generic"));
  } catch (error) {
    logger.error({ error }, "Failed to fetch returning user analytics");
    return NextResponse.json(formatErrorEntity(error), { status: 500 });
  }
}
