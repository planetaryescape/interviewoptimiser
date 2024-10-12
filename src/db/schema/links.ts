import { relations } from "drizzle-orm";
import { index, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { cvs } from "./cvs";

export const links = pgTable(
  "links",
  {
    id: serial("id").primaryKey(),
    cvId: integer("cv_id")
      .references(() => cvs.id)
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    url: varchar("url", { length: 255 }).notNull(),
    order: integer("order").notNull(),
  },
  (table) => ({
    cvIdIdx: index("links_cv_id_idx").on(table.cvId),
  })
);

export const linkRelations = relations(links, ({ one }) => ({
  cv: one(cvs, {
    fields: [links.cvId],
    references: [cvs.id],
  }),
}));

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
