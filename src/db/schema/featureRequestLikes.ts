import { relations } from "drizzle-orm";
import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { featureRequests } from "./featureRequests";
import { users } from "./users";

export const featureRequestLikes = pgTable("feature_request_likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  featureRequestId: integer("feature_request_id")
    .references(() => featureRequests.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
