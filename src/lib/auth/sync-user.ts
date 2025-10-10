import { clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { config } from "~/config";
import { db } from "~/db";
import { users } from "~/db/schema";
import { logger } from "~/lib/logger";
import { stripe } from "~/lib/stripe";

/**
 * Syncs a user from Clerk to the database if they don't exist
 * This handles cases where the webhook hasn't fired or failed
 */
export async function syncUserFromClerk(clerkUserId: string): Promise<boolean> {
  try {
    // First check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);

    if (existingUser.length > 0) {
      logger.debug({ clerkUserId }, "User already exists in database");
      return true;
    }

    // Get user data from Clerk using the clerkClient
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkUserId);

    if (!clerkUser) {
      logger.error({ clerkUserId }, "Could not fetch user from Clerk");
      return false;
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) {
      logger.error({ clerkUserId }, "User has no email address in Clerk");
      return false;
    }

    logger.info({ clerkUserId, email }, "Syncing user from Clerk to database");

    // Create Stripe customer
    let stripeCustomerId: string | undefined;
    try {
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          clerkUserId: clerkUserId,
        },
      });
      stripeCustomerId = customer.id;
    } catch (error) {
      logger.error({ error, clerkUserId }, "Failed to create Stripe customer during sync");
      // Continue without Stripe customer ID - it can be added later
    }

    // Insert user into database
    await db.insert(users).values({
      clerkUserId: clerkUserId,
      email: email.toLowerCase().trim(),
      username: email.toLowerCase().trim(),
      firstname: clerkUser.firstName || undefined,
      lastname: clerkUser.lastName || undefined,
      role: "user",
      minutes: config.startingFreeMinutes,
      stripeCustomerId: stripeCustomerId,
    });

    logger.info({ clerkUserId, email }, "User successfully synced from Clerk");
    return true;
  } catch (error) {
    logger.error({ error, clerkUserId }, "Failed to sync user from Clerk");
    return false;
  }
}
