import { pgTable, uniqueIndex } from "drizzle-orm/pg-core";

export const changelogs = pgTable(
  "changelogs",
  (p) => ({
    id: p.serial().primaryKey(),
    date: p.timestamp().defaultNow().notNull(),
    title: p.varchar({ length: 255 }).notNull(),
    content: p.text().notNull(),
    likes: p.integer().default(0).notNull(),
    createdAt: p.timestamp().defaultNow().notNull(),
    updatedAt: p.timestamp().defaultNow().notNull(),
  }),
  (changelogs) => ({
    dateIdx: uniqueIndex("changelogs_date_idx").on(changelogs.date),
  })
);

export type Changelog = typeof changelogs.$inferSelect;
export type NewChangelog = typeof changelogs.$inferInsert;
