import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { cvs } from "./cvs";

export const experiences = pgTable(
  "experiences",
  {
    id: serial("id").primaryKey(),
    cvId: integer("cv_id")
      .references(() => cvs.id)
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    company: varchar("company", { length: 255 }).notNull(),
    location: varchar("location", { length: 255 }).notNull(),
    startDate: varchar("start_date", { length: 255 }).notNull(),
    endDate: varchar("end_date", { length: 255 }),
    current: boolean("current").notNull().default(false),
    description: text("description").notNull(),
    order: serial("order").notNull(),
  },
  (table) => ({
    cvIdIdx: index("experiences_cv_id_idx").on(table.cvId),
  })
);

export const experienceRelations = relations(experiences, ({ one }) => ({
  cv: one(cvs, {
    fields: [experiences.cvId],
    references: [cvs.id],
  }),
}));

export type Experience = typeof experiences.$inferSelect;
export type NewExperience = typeof experiences.$inferInsert;
