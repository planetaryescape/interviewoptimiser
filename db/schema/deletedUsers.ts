import { pgTable, uniqueIndex } from "drizzle-orm/pg-core";

export const deletedUsers = pgTable(
  "deleted_users",
  (p) => ({
    id: p.serial().primaryKey(),
    emailHash: p.varchar({ length: 64 }).notNull(), // SHA-256 produces 64 char hex string
    deletedAt: p
      .timestamp()
      .$default(() => new Date())
      .notNull(),
    clerkUserId: p.varchar({ length: 255 }), // Keep for audit purposes
    hasUsedFreeMinutes: p.boolean().default(true).notNull(), // Track if they used free minutes
  }),
  (deletedUsers) => [
    uniqueIndex("deleted_users_email_hash_idx").on(deletedUsers.emailHash),
  ]
);

export type DeletedUser = typeof deletedUsers.$inferSelect;
export type NewDeletedUser = typeof deletedUsers.$inferInsert;