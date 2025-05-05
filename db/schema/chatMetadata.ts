import { relations } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { interviews } from "./interviews";

/**
 * This table stores chat metadata for interviews
 * It has a one-to-one relationship with the interviews table
 */
export const chatMetadata = pgTable("chat_metadata", (p) => ({
  id: p.serial().primaryKey(),
  interviewId: p
    .integer()
    .references(() => interviews.id)
    .notNull(),
  customSessionId: p.text(),
  chatGroupId: p.text().notNull(),
  chatId: p.text().notNull(),
  requestId: p.text(),
  createdAt: p.timestamp().defaultNow().notNull(),
  updatedAt: p.timestamp().defaultNow().notNull(),
}));

export const chatMetadataRelations = relations(chatMetadata, ({ one }) => ({
  interview: one(interviews, {
    fields: [chatMetadata.interviewId],
    references: [interviews.id],
  }),
}));

export type ChatMetadata = typeof chatMetadata.$inferSelect;
export type NewChatMetadata = typeof chatMetadata.$inferInsert;
