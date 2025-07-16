import AccountDeletedEmail from "@/emails/account-deleted";
import AdminNotificationEmail from "@/emails/admin-notification";
import WelcomeEmail from "@/emails/welcome";
import { getUserFromClerkId } from "@/lib/auth";
import { createDefaultApiRouteContext } from "@/lib/createDefaultApiRouteContext";
import { hashEmail } from "@/lib/utils/emailHash";
import { formatErrorEntity } from "@/lib/utils/formatEntity";
import type { ClerkWebhookPayload } from "@/types/clerk-webhooks";
import * as Sentry from "@sentry/nextjs";
import { countDistinct, eq, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { config } from "~/config";
import { db } from "~/db";
import {
  customisations,
  deletedUsers,
  featureRequestLikes,
  featureRequests,
  images,
  jobs,
  organizationMembers,
  reviews,
  statistics,
  users,
} from "~/db/schema";
import { sendDiscordDM } from "~/lib/discord";
import { logger } from "~/lib/logger";
import PostHogClient from "~/lib/posthog";
import { resend } from "~/lib/resend";
import { stripe } from "~/lib/stripe";

const newUserSchema = createInsertSchema(users);

export async function POST(request: Request) {
  const context = {
    ...(await createDefaultApiRouteContext(request)),
  };

  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      logger.error({ ...context }, "CLERK_WEBHOOK_SECRET is not set");
      return NextResponse.json(formatErrorEntity("Webhook secret not configured"), { status: 500 });
    }

    const svix_id = request.headers.get("svix-id");
    const svix_timestamp = request.headers.get("svix-timestamp");
    const svix_signature = request.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      logger.warn(
        { ...context, headers: { svix_id, svix_timestamp, svix_signature } },
        "Missing webhook signature headers"
      );
      return NextResponse.json(formatErrorEntity("Missing webhook signature headers"), {
        status: 401,
      });
    }

    const body = await request.text();
    const wh = new Webhook(WEBHOOK_SECRET);

    let data: ClerkWebhookPayload;
    try {
      data = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as ClerkWebhookPayload;
    } catch (err) {
      logger.warn(
        { ...context, error: err instanceof Error ? err.message : "Unknown error" },
        "Invalid webhook signature"
      );
      return NextResponse.json(formatErrorEntity("Invalid webhook signature"), { status: 401 });
    }

    logger.info({ ...context, event: data }, "Webhook received and verified");

    if (data.type === "user.created") {
      logger.info({}, "Getting number of users");
      const [numOfUsers] = await db.select({ count: countDistinct(users.id) }).from(users);

      logger.info({ ...context, numUsers: numOfUsers }, "Number of users");

      logger.info({}, "Creating Stripe customer");
      const customer = await stripe.customers.create({
        email: data.data.email_addresses[0].email_address,
      });

      logger.info({ ...context, customer }, "Stripe customer created");

      try {
        // Normalize email to ensure consistent casing
        const userEmail = data.data.email_addresses[0].email_address.toLowerCase().trim();

        // Check if this email was previously deleted and used free minutes
        logger.info({}, "Checking for previously deleted user");
        const emailHash = hashEmail(userEmail);
        const [previouslyDeleted] = await db
          .select()
          .from(deletedUsers)
          .where(eq(deletedUsers.emailHash, emailHash))
          .limit(1);

        let minutesToAllocate = 0;
        let isReturningDeletedUser = false;

        if (previouslyDeleted?.hasUsedFreeMinutes) {
          logger.info(
            { ...context, previouslyDeleted },
            "User was previously deleted and used free minutes"
          );
          // Don't give free minutes to users who deleted their account after using free minutes
          minutesToAllocate = 0;
          isReturningDeletedUser = true;
        } else {
          // New user or user who never used their free minutes
          minutesToAllocate =
            config.earlyBirdPromo.enabled && numOfUsers.count < config.earlyBirdPromo.userCount
              ? config.earlyBirdPromo.minutes
              : config.startingFreeMinutes;
        }

        logger.info({}, "Creating new user");
        const newUser = newUserSchema.parse({
          username: userEmail,
          firstname: data.data.first_name,
          lastname: data.data.last_name,
          clerkUserId: data.data.id,
          email: userEmail,
          role: "user",
          minutes: minutesToAllocate,
          stripeCustomerId: customer.id,
        });

        const { email, ...userWithoutEmail } = newUser;

        logger.info(
          {
            ...context,
            newUser,
          },
          "Inserting new user"
        );

        const user = await db
          .insert(users)
          .values({
            ...userWithoutEmail,
            email,
          })
          .onConflictDoUpdate({
            target: users.email,
            set: userWithoutEmail,
          });

        await db
          .update(statistics)
          .set({
            usersCount: sql`${statistics.usersCount} + 1`,
          })
          .where(eq(statistics.id, 1));

        logger.info({ ...context, data, user }, "User created");

        // Track analytics for returning deleted users
        if (isReturningDeletedUser && previouslyDeleted) {
          const posthog = PostHogClient();
          const daysSinceDeletion = Math.floor(
            (new Date().getTime() - new Date(previouslyDeleted.deletedAt).getTime()) /
              (1000 * 60 * 60 * 24)
          );

          await posthog.capture({
            distinctId: data.data.id, // Using Clerk ID for consistency
            event: "returning_deleted_user",
            properties: {
              email_hash: emailHash,
              days_since_deletion: daysSinceDeletion,
              deletion_date: previouslyDeleted.deletedAt,
              had_used_free_minutes: previouslyDeleted.hasUsedFreeMinutes,
              minutes_allocated: minutesToAllocate,
            },
          });
          await posthog.shutdown();

          logger.info(
            {
              ...context,
              daysSinceDeletion,
              previousDeletionDate: previouslyDeleted.deletedAt,
            },
            "Returning deleted user tracked"
          );
        }

        logger.info({}, "Sending welcome email");
        const emailResponse = await resend.emails.send({
          from: `${config.projectName} Team <welcome@${config.domain}>`,
          to: email,
          subject: `Welcome to ${config.projectName}`,
          react: WelcomeEmail({ firstName: data.data.first_name || undefined }),
        });
        logger.info({ ...context, emailResponse }, "Welcome email sent");

        // Send admin notification
        const adminNotificationSubject = isReturningDeletedUser
          ? `⚠️ Returning Deleted User - ${userEmail}`
          : `New User Signup - ${userEmail}`;

        await resend.emails.send({
          from: `${config.projectName} Notifications <notifications@${config.domain}>`,
          to: config.supportEmail,
          subject: adminNotificationSubject,
          react: AdminNotificationEmail({
            eventType: isReturningDeletedUser ? "returning_deleted_user" : "signup",
            userData: {
              email: userEmail,
              firstName: data.data.first_name || undefined,
              lastName: data.data.last_name || undefined,
              timestamp: new Date().toISOString(),
              isReturningDeletedUser,
              minutesAllocated: minutesToAllocate,
              ...(isReturningDeletedUser &&
                previouslyDeleted && {
                  previousDeletionDate: previouslyDeleted.deletedAt.toISOString(),
                  daysSinceDeletion: Math.floor(
                    (new Date().getTime() - new Date(previouslyDeleted.deletedAt).getTime()) /
                      (1000 * 60 * 60 * 24)
                  ),
                }),
            },
          }),
        });

        await sendDiscordDM({
          title: isReturningDeletedUser ? "⚠️ Returning deleted user signup" : "🎉 New user signup",
          metadata: {
            Email: userEmail,
            Name: `${data.data.first_name} ${data.data.last_name}`,
            Timestamp: new Date().toISOString(),
            ...(isReturningDeletedUser && {
              "Returning User": "Yes",
              "Minutes Allocated": minutesToAllocate,
              "Days Since Deletion": previouslyDeleted
                ? Math.floor(
                    (new Date().getTime() - new Date(previouslyDeleted.deletedAt).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                : "Unknown",
            }),
          },
        });

        return NextResponse.json(null, { status: 200 });
      } catch (error) {
        Sentry.withScope((scope) => {
          scope.setExtra("context", "POST /api/webhooks/auth - user.created");
          scope.setExtra("error", error);
          Sentry.captureException(error);
        });
        logger.error(
          {
            message: error instanceof Error ? error.message : "Unknown error",
            error,
          },
          "Failed to create new user"
        );
        return NextResponse.json(formatErrorEntity("Internal server error"), {
          status: 500,
        });
      }
    }

    if (data.type === "user.updated") {
      try {
        let customerId: string | undefined;
        const customerSearch = await stripe.customers.search({
          query: `email:${data.data.email_addresses[0].email_address}`,
        });

        if (!customerSearch.data[0]) {
          logger.info({ ...context, data: data.data }, "Customer not found, creating customer");
          const customer = await stripe.customers.create({
            email: data.data.email_addresses[0].email_address,
          });
          customerId = customer.id;
        } else {
          customerId = customerSearch.data[0].id;
        }

        await db
          .update(users)
          .set({
            email: data.data.email_addresses[0].email_address,
            firstname: data.data.first_name,
            lastname: data.data.last_name,
            clerkUserId: data.data.id,
            stripeCustomerId: customerId,
            username: data.data.email_addresses[0].email_address,
          })
          .where(eq(users.clerkUserId, data.data.id));
        logger.info({ ...context, data: data.data }, "User updated");

        // await resend.emails.send({
        //   from: `${config.projectName} Team <support@${config.domain}>`,
        //   to: data.data.email_addresses[0].email_address,
        //   subject: `${config.projectName} | User details updated`,
        //   react: UserDetailsUpdateEmail({ firstName: data.data.first_name }),
        // });

        return NextResponse.json(null, { status: 200 });
      } catch (error) {
        Sentry.withScope((scope) => {
          scope.setExtra("context", "POST /api/webhooks/auth - user.updated");
          scope.setExtra("error", error);
          Sentry.captureException(error);
        });
        logger.error(
          {
            message: error instanceof Error ? error.message : "Unknown error",
            error,
          },
          "Failed to update user"
        );
        return NextResponse.json(formatErrorEntity("Internal server error"), {
          status: 500,
        });
      }
    }

    if (data.type === "user.deleted") {
      try {
        const clerkUserId = data.data.id;

        const user = await getUserFromClerkId(clerkUserId);
        logger.info({ ...context, user }, "User");

        if (!user || !user.id) {
          logger.error({ ...context, clerkUserId }, "User not found in Clerk but was deleted");
          throw new Error("User not found in Clerk but was deleted");
        }

        const userId = user.id;
        const email = user.email;
        const firstName = user.firstName;
        const lastName = user.lastName;

        if (!email) {
          logger.error({ ...context, user }, "User email not found");
          throw new Error("User email not found");
        }

        await db.transaction(async (tx) => {
          try {
            logger.info({ userId }, "Starting user deletion transaction");

            // Delete feature request likes
            logger.info({ userId }, "Deleting feature request likes");
            await tx.delete(featureRequestLikes).where(eq(featureRequestLikes.userId, userId));
            logger.info({ userId }, "Feature request likes deleted");

            // Delete feature requests
            logger.info({ userId }, "Deleting feature requests");
            await tx.delete(featureRequests).where(eq(featureRequests.userId, userId));
            logger.info({ userId }, "Feature requests deleted");

            // Delete reviews
            logger.info({ userId }, "Deleting reviews");
            await tx.delete(reviews).where(eq(reviews.userId, userId));
            logger.info({ userId }, "Reviews deleted");

            // Delete images (note: uses promptId column to reference users)
            logger.info({ userId }, "Deleting images");
            await tx.delete(images).where(eq(images.promptId, userId));
            logger.info({ userId }, "Images deleted");

            // Delete organization memberships
            logger.info({ userId }, "Deleting organization memberships");
            await tx.delete(organizationMembers).where(eq(organizationMembers.userId, userId));
            logger.info({ userId }, "Organization memberships deleted");

            // Delete jobs (this cascades to interviews, reports, etc.)
            logger.info({ userId }, "Deleting jobs");
            await tx.delete(jobs).where(eq(jobs.userId, userId));
            logger.info({ userId }, "Jobs deleted");

            // Delete customisations
            logger.info({ userId }, "Deleting customisations");
            await tx.delete(customisations).where(eq(customisations.userId, userId));
            logger.info({ userId }, "Customisations deleted");

            // Record the deleted user's hashed email before deletion
            logger.info({ userId }, "Recording deleted user email hash");
            const emailHash = hashEmail(email);
            await tx.insert(deletedUsers).values({
              emailHash,
              clerkUserId,
              hasUsedFreeMinutes:
                (user.minutes ?? config.startingFreeMinutes) < config.startingFreeMinutes, // User has used some minutes
            });
            logger.info({ userId }, "Deleted user record created");

            // Finally, delete the user
            logger.info({ userId }, "Deleting user");
            await tx.delete(users).where(eq(users.id, userId));
            logger.info({ userId }, "User deleted");

            // Decrement the user count in statistics
            logger.info({ userId }, "Updating statistics");
            await tx
              .update(statistics)
              .set({
                usersCount: sql`${statistics.usersCount} - 1`,
              })
              .where(eq(statistics.id, 1));
            logger.info({ userId }, "Statistics updated");

            logger.info({ ...context, userId }, "User deletion transaction completed successfully");
          } catch (error) {
            logger.error(
              {
                message: error instanceof Error ? error.message : "Unknown error",
                error,
                userId,
              },
              "Error during user deletion transaction - rolling back"
            );
            throw error; // This will trigger the transaction rollback
          }
        });

        logger.info({ email }, "Sending account deleted email");
        if (email) {
          const emailResponse = await resend.emails.send({
            from: `${config.projectName} Team <support@${config.domain}>`,
            to: email,
            replyTo: "cvoptimiser@bhekani.com",
            subject: `${config.projectName} | Account deleted`,
            react: AccountDeletedEmail({ firstName }),
          });

          logger.info({ ...context, emailResponse }, "Account deleted email sent");
        }

        // Send admin notification
        await resend.emails.send({
          from: `${config.projectName} Notifications <notifications@${config.domain}>`,
          to: config.supportEmail,
          subject: `User Account Deleted - ${email}`,
          react: AdminNotificationEmail({
            eventType: "deletion",
            userData: {
              email: email || "Unknown",
              firstName,
              lastName,
              timestamp: new Date().toISOString(),
            },
          }),
        });

        await sendDiscordDM({
          title: "👋 User account deleted",
          metadata: {
            Email: email || "Unknown",
            Name: `${firstName} ${lastName}`,
            Timestamp: new Date().toISOString(),
          },
        });

        return NextResponse.json(null, { status: 200 });
      } catch (error) {
        Sentry.withScope((scope) => {
          scope.setExtra("context", "POST /api/webhooks/auth - user.deleted");
          scope.setExtra("error", error);
          Sentry.captureException(error);
        });
        logger.error(
          {
            message: error instanceof Error ? error.message : "Unknown error",
            error,
          },
          "Failed to delete user and related data"
        );
        return NextResponse.json(formatErrorEntity("Internal server error"), {
          status: 500,
        });
      }
    }

    return NextResponse.json(
      {
        webhookType: (data as ClerkWebhookPayload).type,
        message: "Unhandled webhook type",
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "POST /api/webhooks/auth - top level");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Webhook processing failed"
    );
    return NextResponse.json(formatErrorEntity("Webhook processing failed"), {
      status: 500,
    });
  }
}
