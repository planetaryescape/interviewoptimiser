import { pgTable } from "drizzle-orm/pg-core";

export const statistics = pgTable("statistics", (p) => ({
  id: p.serial().primaryKey(),
  interviewsCount: p.integer().notNull(),
  minutesCount: p.integer().notNull(),
  usersCount: p.integer().notNull(),
  createdAt: p.timestamp().defaultNow().notNull(),
  updatedAt: p.timestamp().defaultNow().notNull(),
}));

export type Statistics = typeof statistics.$inferSelect;
export type NewStatistics = typeof statistics.$inferInsert;
