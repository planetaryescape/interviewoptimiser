import { relations } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";
import { jobs } from "./jobs";
import { reports } from "./reports";

/**
 * This table stores chat metadata for jobs
 * It has a one-to-one relationship with the jobs table
 */
export const chats = pgTable(
  "chats",
  (p) => ({
    id: p.serial().primaryKey(),
    jobId: p
      .integer()
      .references(() => jobs.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
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
  (chats) => [index("chats_job_id_idx").on(chats.jobId)]
);

export const chatsRelations = relations(chats, ({ one }) => ({
  job: one(jobs, {
    fields: [chats.jobId],
    references: [jobs.id],
  }),
  report: one(reports, {
    fields: [chats.id],
    references: [reports.chatId],
  }),
}));

export type Chat = typeof chats.$inferSelect;
export type NewChat = typeof chats.$inferInsert;
