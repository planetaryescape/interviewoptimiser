import { getReturningUserStats } from "@/lib/analytics/returning-users";
import { withAuth } from "@/lib/auth-middleware";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { type NextRequest, NextResponse } from "next/server";
import { logger } from "~/lib/logger";

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
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
});
