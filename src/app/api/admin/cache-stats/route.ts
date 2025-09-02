import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { cache } from "@/lib/cache";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { logger } from "~/lib/logger";

export const GET = withAuth(
  async (_request, { user }) => {
    try {
      if (user.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json(formatErrorEntity("Unauthorized"), {
          status: 403,
        });
      }

      const stats = await cache.getStats();

      if (!stats) {
        return NextResponse.json(formatEntity({ message: "Cache not enabled" }, "cache-stats"));
      }

      const hitRate =
        stats.hits + stats.misses > 0
          ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2)
          : 0;

      const enhancedStats = {
        ...stats,
        hitRate: `${hitRate}%`,
        totalRequests: stats.hits + stats.misses,
      };

      logger.info({ stats: enhancedStats }, "Retrieved cache statistics");
      return NextResponse.json(formatEntity(enhancedStats, "cache-stats"));
    } catch (error) {
      logger.error({ error }, "Error retrieving cache stats");
      return NextResponse.json(formatErrorEntity("Internal server error"), {
        status: 500,
      });
    }
  },
  { routeName: "GET /api/admin/cache-stats" }
);
