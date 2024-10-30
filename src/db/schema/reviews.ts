import { relations } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";
import { users } from "./users";

export const reviews = pgTable(
  "reviews",
  (p) => ({
    id: p.serial().primaryKey(),
    userId: p
      .integer()
      .references(() => users.id)
      .notNull(),
    name: p.varchar({ length: 255 }).notNull(),
    rating: p.integer().notNull(),
    comment: p.text().notNull(),
    twitterUsername: p.varchar({ length: 255 }),
    linkedinUrl: p.varchar({ length: 255 }),
    showOnLanding: p.boolean().default(false).notNull(),
    isPublished: p.boolean().default(false).notNull(),
    createdAt: p.timestamp().defaultNow().notNull(),
    updatedAt: p.timestamp().defaultNow().notNull(),
  }),
  (reviews) => ({
    userIdIdx: index("reviews_user_id_idx").on(reviews.userId),
  })
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
