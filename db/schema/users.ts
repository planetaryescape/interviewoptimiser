import { relations } from "drizzle-orm";
import { pgEnum, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { customisations } from "./customisations";
import { featureRequestLikes } from "./featureRequestLikes";
import { organizationMembers } from "./organizations";

export const roleEnum = pgEnum("role", ["user", "admin", "recruiter"]);

export const users = pgTable(
  "users",
  (p) => ({
    id: p.serial().primaryKey(),
    username: p.varchar({ length: 255 }).notNull().unique(),
    firstname: p.varchar({ length: 255 }),
    lastname: p.varchar({ length: 255 }),
    role: roleEnum().notNull().default("user"),
    stripeCustomerId: p.varchar({ length: 255 }),
    stripeSubscriptionId: p.varchar({ length: 255 }),
    stripeSubscriptionInterval: p.varchar({ length: 255 }),
    stripePriceId: p.varchar({ length: 255 }),
    stripePlanId: p.varchar({ length: 255 }),
    trialUsed: p.boolean().default(false),
    isDeleted: p.boolean().default(false),
    clerkUserId: p.varchar({ length: 255 }),
    email: p.varchar({ length: 255 }).notNull().unique(),
    createdAt: p
      .timestamp()
      .$default(() => new Date())
      .notNull(),
    updatedAt: p
      .timestamp()
      .$default(() => new Date())
      .notNull(),
    minutes: p.integer().notNull().default(2),
    defaultCvText: p.text(),
    defaultCvFilename: p.varchar({ length: 255 }),
  }),
  (users) => [
    uniqueIndex("users_username_idx").on(users.username),
    uniqueIndex("users_stripe_customer_id_idx").on(users.stripeCustomerId),
    uniqueIndex("users_email_idx").on(users.email),
    uniqueIndex("users_clerk_user_id_idx").on(users.clerkUserId),
  ]
);

export const userRelations = relations(users, ({ many, one }) => ({
  customisation: one(customisations, {
    fields: [users.id],
    references: [customisations.userId],
  }),
  featureRequestLikes: many(featureRequestLikes),
  organizationMemberships: many(organizationMembers),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
