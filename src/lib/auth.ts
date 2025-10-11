import { syncUserFromClerk } from "@/lib/auth/sync-user";
import { kv } from "@vercel/kv";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { type User, users } from "~/db/schema";
import { logger } from "~/lib/logger";

export interface GetUserOptions {
  useCache?: boolean;
  ttl?: number;
}

export interface UserData {
  id?: number;
  minutes?: number;
  role?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  stripeCustomerId?: string;
}

const isCacheEnabled = () => !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

export async function getUserFromClerkId(
  clerkUserId: string,
  options: GetUserOptions = { useCache: true, ttl: 300 }
): Promise<UserData> {
  if (!clerkUserId) {
    return {};
  }

  const cacheKey = `user:${clerkUserId}`;

  if (options.useCache && isCacheEnabled()) {
    try {
      const cachedUser = await kv.get(cacheKey);
      if (cachedUser && typeof cachedUser === "object" && "id" in cachedUser) {
        logger.debug({ clerkUserId }, "User data retrieved from cache");
        return cachedUser as UserData;
      }
    } catch (error) {
      logger.warn({ error, clerkUserId }, "Cache retrieval failed, falling back to database");
    }
  }

  const user = await db
    .select({
      id: users.id,
      minutes: users.minutes,
      role: users.role,
      email: users.email,
      firstName: users.firstname,
      lastName: users.lastname,
      stripeCustomerId: users.stripeCustomerId,
    })
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  if (!user.length) {
    // User not found in database - attempt to sync from Clerk
    logger.info({ clerkUserId }, "User not found in database, attempting sync from Clerk");

    const syncedUser = await syncUserFromClerk(clerkUserId);

    if (syncedUser) {
      logger.info({ clerkUserId, userId: syncedUser.id }, "User successfully synced from Clerk");

      // Cache the synced user data
      if (options.useCache && isCacheEnabled()) {
        try {
          const cacheOpts = options.ttl ? { ex: options.ttl } : undefined;
          await kv.set(cacheKey, syncedUser, cacheOpts);
          logger.debug({ clerkUserId, ttl: options.ttl }, "Synced user data cached");
        } catch (error) {
          logger.warn({ error, clerkUserId }, "Failed to cache synced user data");
        }
      }

      return syncedUser;
    }

    logger.warn({ clerkUserId }, "Failed to sync user from Clerk");
    return {};
  }

  const userData = {
    id: user[0].id,
    minutes: user[0].minutes,
    role: user[0].role,
    email: user[0].email,
    firstName: user[0].firstName ?? undefined,
    lastName: user[0].lastName ?? undefined,
    stripeCustomerId: user[0].stripeCustomerId ?? undefined,
  };

  if (options.useCache && isCacheEnabled()) {
    try {
      const cacheOpts = options.ttl ? { ex: options.ttl } : undefined;
      await kv.set(cacheKey, userData, cacheOpts);
      logger.debug({ clerkUserId, ttl: options.ttl }, "User data cached");
    } catch (error) {
      logger.warn({ error, clerkUserId }, "Failed to cache user data");
    }
  }

  return userData;
}

export async function invalidateUserCache(clerkUserId: string): Promise<void> {
  if (isCacheEnabled()) {
    try {
      const cacheKey = `user:${clerkUserId}`;
      await kv.del(cacheKey);
      logger.debug({ clerkUserId }, "User cache invalidated");
    } catch (error) {
      logger.warn({ error, clerkUserId }, "Failed to invalidate user cache");
    }
  }
}

export async function getUserFromId(userId: number): Promise<User | null> {
  if (!userId) {
    return null;
  }

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getUserFromEmail(email: string): Promise<User | null> {
  if (!email) {
    return null;
  }

  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (user.length === 0) {
    return null;
  }
  return user[0];
}
