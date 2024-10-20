import { db } from "@/db";
import { customisations, interviews, users } from "@/db/schema";
import AccountDeletedEmail from "@/emails/account-deleted";
import WelcomeEmail from "@/emails/welcome";
import { getUserFromClerkId } from "@/lib/auth";
import { config } from "@/lib/config";
import { createDefaultApiRouteContext } from "@/lib/createDefaultApiRouteContext";
import { logger } from "@/lib/logger";
import { resend } from "@/lib/resend";
import { stripe } from "@/lib/stripe";
import { formatErrorEntity } from "@/lib/utils/formatEntity";
import * as Sentry from "@sentry/nextjs";
import { countDistinct, eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { NextResponse } from "next/server";

const newUserSchema = createInsertSchema(users);

export async function POST(request: Request) {
  const data = await request.json();

  const context = {
    ...createDefaultApiRouteContext(request),
  };

  logger.info({ ...context, event: data }, "Webhook received");

  if (data.type === "user.created") {
    logger.info({}, "Getting number of users");
    const [numOfUsers] = await db
      .select({ count: countDistinct(users.id) })
      .from(users);

    logger.info({ ...context, numUsers: numOfUsers }, "Number of users");

    logger.info({}, "Creating Stripe customer");
    const customer = await stripe.customers.create({
      email: data.data.email_addresses[0].email_address,
    });

    logger.info({ ...context, customer }, "Stripe customer created");

    try {
      logger.info({}, "Creating new user");
      const newUser = newUserSchema.parse({
        username: data.data.email_addresses[0].email_address,
        firstname: data.data.first_name,
        lastname: data.data.last_name,
        clerkUserId: data.data.id,
        email: data.data.email_addresses[0].email_address,
        role: "user",
        minutes:
          config.earlyBirdPromo.enabled &&
          numOfUsers.count < config.earlyBirdPromo.userCount
            ? config.earlyBirdPromo.minutes
            : config.startingFreeMinutes,
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

      logger.info({ ...context, data, user }, "User created");

      logger.info({}, "Sending welcome email");
      const emailResponse = await resend.emails.send({
        from: `${config.projectName} Team <welcome@${config.domain}>`,
        to: email,
        subject: `Welcome to ${config.projectName}`,
        react: WelcomeEmail({ firstName: data.data.first_name }),
      });
      logger.info({ ...context, emailResponse }, "Welcome email sent");

      return NextResponse.json(null, { status: 200 });
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "POST /api/webhooks/auth");
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
      await db
        .update(users)
        .set({
          email: data.data.email_addresses[0].email_address,
          firstname: data.data.first_name,
          lastname: data.data.last_name,
          clerkUserId: data.data.id,
        })
        .where(eq(users.clerkUserId, data.data.id));
      logger.info({ ...context, data: data.data }, "User updated");

      // await resend.emails.send({
      //   from: `${config.projectName} Team <support@${config.domain}>`,
      //   to: data.data.email_addresses[0].email_address,
      //   subject: `${config.projectName} | User details updated`,
      //   react: UserDetailsUpdateEmail({ firstName: data.data.first_name }),
      // });

      return NextResponse.json(null, { status: 204 });
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "POST /api/webhooks/auth");
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
        logger.error(
          { ...context, clerkUserId },
          "User not found in Clerk but was deleted"
        );
        throw new Error("User not found in Clerk but was deleted");
      }

      const userId = user.id;
      const email = user.email;
      const firstName = user.firstName;

      await db.transaction(async (tx) => {
        logger.info({}, "Deleting CV-related data");
        // Delete CV-related data

        logger.info({}, "Deleting interviews");
        // Delete optimizations
        await tx.delete(interviews).where(eq(interviews.userId, userId));

        // Delete customisations
        logger.info({}, "Deleting customisations");
        await tx
          .delete(customisations)
          .where(eq(customisations.userId, userId));

        // Finally, delete the user
        logger.info({}, "Deleting user");
        const result = await tx.delete(users).where(eq(users.id, userId));

        logger.info({ ...context, result }, "User and related data deleted");
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

        logger.info(
          { ...context, emailResponse },
          "Account deleted email sent"
        );
      }

      return NextResponse.json(null, { status: 200 });
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "POST /api/webhooks/auth");
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
      webhookType: data.type,
      message: "Unhandled webhook type",
    },
    { status: 200 }
  );
}
