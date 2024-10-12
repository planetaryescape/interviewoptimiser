import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { coverLetters } from "./coverLetters";
import { cvs } from "./cvs";

export const paperSizeEnum = pgEnum("paper_size", ["A4", "Letter", "Legal"]);
export const marginSizeEnum = pgEnum("margin_size", [
  "Normal",
  "Narrow",
  "Wide",
]);

export const pageSettings = pgTable("page_settings", {
  id: serial("id").primaryKey(),
  paperSize: paperSizeEnum("paper_size").notNull(),
  headingFont: varchar("heading_font", { length: 255 }).notNull(),
  bodyFont: varchar("body_font", { length: 255 }).notNull(),
  marginSize: marginSizeEnum("margin_size").notNull(),
  layout: varchar("layout", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pageSettingsRelations = relations(pageSettings, ({ many }) => ({
  cvs: many(cvs),
  coverLetters: many(coverLetters),
}));

export type PageSettings = typeof pageSettings.$inferSelect;
export type NewPageSettings = typeof pageSettings.$inferInsert;
