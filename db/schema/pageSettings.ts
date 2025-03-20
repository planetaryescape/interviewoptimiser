import { relations } from "drizzle-orm";
import { pgEnum, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { reports } from "./reports";

export const paperSizeEnum = pgEnum("paper_size", ["A4", "Letter", "Legal"]);
export const marginSizeEnum = pgEnum("margin_size", ["Normal", "Narrow", "Wide"]);

export const pageSettings = pgTable(
  "page_settings",
  (p) => ({
    id: p.serial().primaryKey(),
    reportId: p.integer().references(() => reports.id),
    paperSize: paperSizeEnum().notNull(),
    headingFont: p.varchar({ length: 255 }).notNull(),
    bodyFont: p.varchar({ length: 255 }).notNull(),
    marginSize: marginSizeEnum().notNull(),
    layout: p.varchar({ length: 255 }).notNull(),
    createdAt: p.timestamp().defaultNow().notNull(),
    updatedAt: p.timestamp().defaultNow().notNull(),
  }),
  (pageSettings) => ({
    reportIdIdx: uniqueIndex("page_settings_report_id_idx").on(pageSettings.reportId),
  })
);

export const pageSettingsRelations = relations(pageSettings, ({ many }) => ({
  reports: many(reports),
}));

export type PageSettings = typeof pageSettings.$inferSelect;
export type NewPageSettings = typeof pageSettings.$inferInsert;
