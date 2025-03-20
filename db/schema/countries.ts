import { pgTable, uniqueIndex } from "drizzle-orm/pg-core";

export const countries = pgTable(
  "countries",
  (p) => ({
    id: p.serial().primaryKey(),
    name: p.varchar({ length: 255 }).notNull(),
    isoCode: p.varchar({ length: 2 }).notNull().unique(),
    continent: p.varchar({ length: 255 }).notNull(),
    createdAt: p.timestamp().defaultNow().notNull(),
    updatedAt: p.timestamp().defaultNow().notNull(),
  }),
  (countries) => ({
    isoCodeIdx: uniqueIndex("countries_iso_code_idx").on(countries.isoCode),
  })
);

export type Country = typeof countries.$inferSelect;
export type NewCountry = typeof countries.$inferInsert;
