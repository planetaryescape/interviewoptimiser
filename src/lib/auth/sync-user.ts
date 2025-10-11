import { clerkClient } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { config } from "~/config";
import { db } from "~/db";
import { users } from "~/db/schema";
import { logger } from "~/lib/logger";
import { stripe } from "~/lib/stripe";

export interface SyncedUser {
  id: number;
  minutes: number;
  role: string;
  email: string;
  firstName?: string;
  lastName?: string;
  stripeCustomerId?: string;
}

/**
 * Syncs a user from Clerk to our database
 * This is a fallback mechanism for when the webhook doesn't fire or fails
 */
export async function syncUserFromClerk(clerkUserId: string): Promise<SyncedUser | null> {
  try {
    logger.info({ clerkUserId }, "Attempting to sync user from Clerk");

    // Get user from Clerk - clerkClient is now async
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkUserId);

    if (!clerkUser) {
      logger.warn({ clerkUserId }, "User not found in Clerk");
      return null;
    }

    // Check if user already exists (maybe webhook is just delayed)
    const existingUser = await db.query.users.findFirst({
      where: eq(users.clerkUserId, clerkUserId),
    });

    if (existingUser) {
      logger.info({ clerkUserId }, "User already exists in database");
      return {
        id: existingUser.id,
        minutes: existingUser.minutes,
        role: existingUser.role,
        email: existingUser.email,
        firstName: existingUser.firstname ?? undefined,
        lastName: existingUser.lastname ?? undefined,
        stripeCustomerId: existingUser.stripeCustomerId ?? undefined,
      };
    }

    // Create Stripe customer
    logger.info({ clerkUserId }, "Creating Stripe customer for synced user");
    const customer = await stripe.customers.create({
      email: clerkUser.emailAddresses[0].emailAddress,
      metadata: {
        clerkUserId: clerkUserId,
        syncedFromClerk: "true",
      },
    });

    // Determine initial minutes
    const [numOfUsers] = await db.select({ count: sql`count(distinct ${users.id})` }).from(users);

    const userCount = Number(numOfUsers.count);
    const minutesToAssign =
      config.earlyBirdPromo.enabled && userCount < config.earlyBirdPromo.userCount
        ? config.earlyBirdPromo.minutes
        : config.startingFreeMinutes;

    // Create user in database
    logger.info({ clerkUserId }, "Creating user in database from Clerk sync");
    const [newUser] = await db
      .insert(users)
      .values({
        username: clerkUser.emailAddresses[0].emailAddress,
        firstname: clerkUser.firstName,
        lastname: clerkUser.lastName,
        clerkUserId: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        role: "user",
        minutes: minutesToAssign,
        stripeCustomerId: customer.id,
      })
      .returning({
        id: users.id,
        minutes: users.minutes,
        role: users.role,
        email: users.email,
        firstname: users.firstname,
        lastname: users.lastname,
        stripeCustomerId: users.stripeCustomerId,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          clerkUserId: clerkUser.id,
          firstname: clerkUser.firstName,
          lastname: clerkUser.lastName,
        },
      });

    logger.info(
      {
        clerkUserId,
        userId: newUser.id,
        email: newUser.email,
      },
      "Successfully synced user from Clerk"
    );

    return {
      id: newUser.id,
      minutes: newUser.minutes,
      role: newUser.role,
      email: newUser.email,
      firstName: newUser.firstname ?? undefined,
      lastName: newUser.lastname ?? undefined,
      stripeCustomerId: newUser.stripeCustomerId ?? undefined,
    };
  } catch (error) {
    logger.error(
      {
        clerkUserId,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "Failed to sync user from Clerk"
    );
    return null;
  }
}
