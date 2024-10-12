import { relations } from "drizzle-orm";
import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { optimizations } from "./optimizations";

export const sectionsOrder = pgTable("sections_order", {
  id: serial("id").primaryKey(),
  optimizationId: integer("optimization_id")
    .references(() => optimizations.id)
    .notNull()
    .unique(),
  experiences: integer("experiences").notNull(),
  educations: integer("educations").notNull(),
  skills: integer("skills").notNull(),
  links: integer("links").notNull(),
  customSections: integer("custom_sections").notNull(),
  summary: integer("summary").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sectionOrderRelations = relations(sectionsOrder, ({ one }) => ({
  optimization: one(optimizations, {
    fields: [sectionsOrder.optimizationId],
    references: [optimizations.id],
  }),
}));

export type SectionsOrder = typeof sectionsOrder.$inferSelect;
export type NewSectionsOrder = typeof sectionsOrder.$inferInsert;
