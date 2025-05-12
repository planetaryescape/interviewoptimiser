import { relations } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";
import { interviews } from "./interviews";
import { reports } from "./reports";
/**
 * This table stores chat metadata for interviews
 * It has a one-to-one relationship with the interviews table
 */
export const chats = pgTable(
  "chats",
  (p) => ({
    id: p.serial().primaryKey(),
    interviewId: p
      .integer()
      .references(() => interviews.id)
      .notNull(),
    customSessionId: p.text(),
    transcript: p.text(),
    chatGroupId: p.text().notNull(),
    humeChatId: p.text().notNull().unique(),
    requestId: p.text().unique(),
    actualTime: p.integer(),
    createdAt: p.timestamp().defaultNow().notNull(),
    updatedAt: p.timestamp().defaultNow().notNull(),
  }),
  (chats) => [index("chats_interview_id_idx").on(chats.interviewId)]
);

export const chatsRelations = relations(chats, ({ one }) => ({
  interview: one(interviews, {
    fields: [chats.interviewId],
    references: [interviews.id],
  }),
  report: one(reports, {
    fields: [chats.id],
    references: [reports.chatId],
  }),
}));

export type Chat = typeof chats.$inferSelect;
export type NewChat = typeof chats.$inferInsert;
