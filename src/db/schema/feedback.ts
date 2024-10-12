import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { optimizations } from "./optimizations";

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  optimizationId: integer("optimization_id")
    .references(() => optimizations.id)
    .notNull(),
  content: text("content").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const feedbackRelations = relations(feedback, ({ one }) => ({
  optimization: one(optimizations, {
    fields: [feedback.optimizationId],
    references: [optimizations.id],
  }),
}));

export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
