import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const changelogs = pgTable("changelogs", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow().notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  likes: integer("likes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Changelog = typeof changelogs.$inferSelect;
export type NewChangelog = typeof changelogs.$inferInsert;
