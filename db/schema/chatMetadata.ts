import { relations } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";
import { reports } from "./reports";

/**
 * This table stores chat metadata for interviews
 * It has a one-to-one relationship with the interviews table
 */
export const chatMetadata = pgTable(
  "chat_metadata",
  (p) => ({
    id: p.serial().primaryKey(),
    reportId: p
      .integer()
      .references(() => reports.id)
      .notNull(),
    customSessionId: p.text(),
    chatGroupId: p.text().notNull(),
    chatId: p.text().notNull(),
    requestId: p.text(),
    createdAt: p.timestamp().defaultNow().notNull(),
    updatedAt: p.timestamp().defaultNow().notNull(),
  }),
  (chatMetadata) => [index("chat_metadata_report_id_idx").on(chatMetadata.reportId)]
);

export const chatMetadataRelations = relations(chatMetadata, ({ one }) => ({
  report: one(reports, {
    fields: [chatMetadata.reportId],
    references: [reports.id],
  }),
}));

export type ChatMetadata = typeof chatMetadata.$inferSelect;
export type NewChatMetadata = typeof chatMetadata.$inferInsert;
