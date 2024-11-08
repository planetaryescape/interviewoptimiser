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
    imageUrl: p.varchar({ length: 255 }),
    twitterUsername: p.varchar({ length: 255 }),
    linkedinUrl: p.varchar({ length: 255 }),
    showOnLanding: p.boolean().default(false).notNull(),
    isPublished: p.boolean().default(false).notNull(),
    processedAt: p.timestamp(),
    createdAt: p.timestamp().defaultNow().notNull(),
    updatedAt: p.timestamp().defaultNow().notNull(),
  }),
  (reviews) => ({
    userIdIdx: index("reviews_user_id_idx").on(reviews.userId),
    showOnLandingIdx: index("reviews_show_on_landing_idx").on(
      reviews.showOnLanding
    ),
    isPublishedIdx: index("reviews_is_published_idx").on(reviews.isPublished),
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
