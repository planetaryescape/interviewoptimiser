import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  serial,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { cvs } from "./cvs";

export const customSections = pgTable(
  "custom_sections",
  {
    id: serial("id").primaryKey(),
    cvId: integer("cv_id")
      .references(() => cvs.id)
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    order: serial("order").notNull(),
  },
  (table) => ({
    cvIdIdx: index("custom_sections_cv_id_idx").on(table.cvId),
  })
);

export const customSectionRelations = relations(customSections, ({ one }) => ({
  cv: one(cvs, {
    fields: [customSections.cvId],
    references: [cvs.id],
  }),
}));

export type CustomSection = typeof customSections.$inferSelect;
export type NewCustomSection = typeof customSections.$inferInsert;
