import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { customSections } from "./customSections";
import { educations } from "./educations";
import { experiences } from "./experiences";
import { links } from "./links";
import { optimizations } from "./optimizations";
import { pageSettings } from "./pageSettings";
import { skills } from "./skills";

export const cvs = pgTable("cvs", {
  id: serial("id").primaryKey(),
  optimizationId: integer("optimization_id")
    .references(() => optimizations.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  pageSettingsId: integer("page_settings_id").references(() => pageSettings.id),
});

export const cvRelations = relations(cvs, ({ one, many }) => ({
  optimization: one(optimizations, {
    fields: [cvs.optimizationId],
    references: [optimizations.id],
  }),
  experiences: many(experiences),
  educations: many(educations),
  skills: many(skills),
  links: many(links),
  customSections: many(customSections),
  pageSettings: one(pageSettings, {
    fields: [cvs.pageSettingsId],
    references: [pageSettings.id],
  }),
}));

export type CV = typeof cvs.$inferSelect;
export type NewCV = typeof cvs.$inferInsert;
