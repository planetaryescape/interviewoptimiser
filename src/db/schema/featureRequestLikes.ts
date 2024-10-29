import { relations } from "drizzle-orm";
import { pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { featureRequests } from "./featureRequests";
import { users } from "./users";

export const featureRequestLikes = pgTable(
  "feature_request_likes",
  (p) => ({
    id: p.serial().primaryKey(),
    userId: p
      .integer()
      .references(() => users.id)
      .notNull(),
    featureRequestId: p
      .integer()
      .references(() => featureRequests.id)
      .notNull(),
    createdAt: p.timestamp().defaultNow().notNull(),
  }),
  (featureRequestLikes) => ({
    userIdIdx: uniqueIndex("feature_request_likes_user_id_idx").on(
      featureRequestLikes.userId
    ),
    featureRequestIdIdx: uniqueIndex(
      "feature_request_likes_feature_request_id_idx"
    ).on(featureRequestLikes.featureRequestId),
  })
);

export const featureRequestLikesRelations = relations(
  featureRequestLikes,
  ({ one }) => ({
    user: one(users, {
      fields: [featureRequestLikes.userId],
      references: [users.id],
    }),
    featureRequest: one(featureRequests, {
      fields: [featureRequestLikes.featureRequestId],
      references: [featureRequests.id],
    }),
  })
);

export type FeatureRequestLike = typeof featureRequestLikes.$inferSelect;
export type NewFeatureRequestLike = typeof featureRequestLikes.$inferInsert;
