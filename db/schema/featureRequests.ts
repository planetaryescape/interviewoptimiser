import { relations } from "drizzle-orm";
import { index, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { featureRequestLikes } from "./featureRequestLikes";
import { users } from "./users";

export const featureRequestStatusEnum = pgEnum("feature_request_status", [
  "submitted",
  "triaged",
  "in_progress",
  "completed",
  "declined",
]);

export const featureRequests = pgTable(
  "feature_requests",
  (p) => ({
    id: p.serial().primaryKey(),
    title: p.text().notNull(),
    content: p.text().notNull(),
    status: featureRequestStatusEnum().default("submitted").notNull(),
    userId: p
      .integer()
      .references(() => users.id)
      .notNull(),
    createdAt: p.timestamp().defaultNow().notNull(),
    updatedAt: p.timestamp().defaultNow().notNull(),
  }),
  (featureRequests) => [index("feature_requests_user_id_idx").on(featureRequests.userId)]
);

export const featureRequestRelations = relations(featureRequests, ({ one, many }) => ({
  user: one(users, {
    fields: [featureRequests.userId],
    references: [users.id],
  }),
  likes: many(featureRequestLikes),
}));

export type FeatureRequest = typeof featureRequests.$inferSelect;
export type NewFeatureRequest = typeof featureRequests.$inferInsert;
