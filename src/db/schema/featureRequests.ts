import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { featureRequestLikes } from "./featureRequestLikes";
import { users } from "./users";

export const featureRequestStatusEnum = pgEnum("feature_request_status", [
  "submitted",
  "triaged",
  "in_progress",
  "completed",
  "declined",
]);

export const featureRequests = pgTable("feature_requests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: featureRequestStatusEnum("status").default("submitted").notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const featureRequestRelations = relations(
  featureRequests,
  ({ one, many }) => ({
    user: one(users, {
      fields: [featureRequests.userId],
      references: [users.id],
    }),
    likes: many(featureRequestLikes),
  })
);

export type FeatureRequest = typeof featureRequests.$inferSelect;
export type NewFeatureRequest = typeof featureRequests.$inferInsert;
