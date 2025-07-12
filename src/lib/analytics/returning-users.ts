import { desc, sql } from "drizzle-orm";
import { db } from "~/db";
import { deletedUsers } from "~/db/schema";

export interface ReturningUserStats {
  totalReturningUsers: number;
  returningUsersLast30Days: number;
  averageDaysBetweenDeletionAndReturn: number;
  returningUsersWhoUsedFreeMinutes: number;
}

/**
 * Get statistics about users who deleted their accounts and then signed up again
 */
export async function getReturningUserStats(): Promise<ReturningUserStats> {
  // Get total count of deleted users
  const [totalCount] = await db.select({ count: sql<number>`count(*)` }).from(deletedUsers);

  // Get count from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [last30Days] = await db
    .select({ count: sql<number>`count(*)` })
    .from(deletedUsers)
    .where(sql`${deletedUsers.deletedAt} >= ${thirtyDaysAgo}`);

  // Get count of users who had used free minutes
  const [usedFreeMinutes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(deletedUsers)
    .where(sql`${deletedUsers.hasUsedFreeMinutes} = true`);

  // Note: To calculate average days between deletion and return, we would need
  // to track when they returned, which would require updating the schema
  // For now, this is a placeholder
  const averageDaysBetweenDeletionAndReturn = 0;

  return {
    totalReturningUsers: Number(totalCount.count),
    returningUsersLast30Days: Number(last30Days.count),
    averageDaysBetweenDeletionAndReturn,
    returningUsersWhoUsedFreeMinutes: Number(usedFreeMinutes.count),
  };
}

/**
 * Get recent returning users for admin dashboard
 */
export async function getRecentReturningUsers(limit = 10) {
  const recentUsers = await db
    .select({
      emailHash: deletedUsers.emailHash,
      deletedAt: deletedUsers.deletedAt,
      clerkUserId: deletedUsers.clerkUserId,
      hasUsedFreeMinutes: deletedUsers.hasUsedFreeMinutes,
    })
    .from(deletedUsers)
    .orderBy(desc(deletedUsers.deletedAt))
    .limit(limit);

  return recentUsers;
}
