import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { config } from "~/config";
import { db } from "~/db";
import { users } from "~/db/schema";
import { logger } from "~/lib/logger";
import { stripe } from "~/lib/stripe";

export async function GET() {
  try {
    // Get the authenticated user from Clerk
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(formatErrorEntity("Not authenticated"), { status: 401 });
    }

    // Check if user already exists in database
    const existingUser = await getUserFromClerkId(clerkUserId);
    if (existingUser.id) {
      return NextResponse.json(
        formatEntity({ message: "User already synced", userId: existingUser.id }, "user")
      );
    }

    // Get user details from Clerk
    const { clerkClient } = await import("@clerk/nextjs/server");
    const { users: clerkUsers } = await clerkClient();
    const clerkUser = await clerkUsers.getUser(clerkUserId);

    if (!clerkUser) {
      logger.error({ clerkUserId }, "Could not fetch user from Clerk");
      return NextResponse.json(formatErrorEntity("Could not fetch user data"), { status: 500 });
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) {
      logger.error({ clerkUserId }, "User has no email address in Clerk");
      return NextResponse.json(formatErrorEntity("No email address found"), { status: 400 });
    }

    logger.info({ clerkUserId, email }, "Creating new user from Clerk sync");

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
    const [newUser] = await db
      .insert(users)
      .values({
        clerkUserId: clerkUserId,
        email: email.toLowerCase().trim(),
        username: email.toLowerCase().trim(),
        firstname: clerkUser.firstName || undefined,
        lastname: clerkUser.lastName || undefined,
        role: "user",
        minutes: config.startingFreeMinutes,
        stripeCustomerId: stripeCustomerId,
      })
      .returning({ id: users.id });

    logger.info({ clerkUserId, email, userId: newUser.id }, "User successfully synced from Clerk");

    return NextResponse.json(
      formatEntity(
        {
          message: "User successfully synced",
          userId: newUser.id,
          email: email,
        },
        "user"
      )
    );
  } catch (error) {
    logger.error({ error }, "Failed to sync user");
    return NextResponse.json(
      formatErrorEntity(error instanceof Error ? error.message : "Failed to sync user"),
      { status: 500 }
    );
  }
}
