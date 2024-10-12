import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  isoCode: varchar("iso_code", { length: 2 }).notNull().unique(),
  continent: varchar("continent", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Country = typeof countries.$inferSelect;
export type NewCountry = typeof countries.$inferInsert;
