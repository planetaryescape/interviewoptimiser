import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  varchar,
} from "drizzle-orm/pg-core";
import { cvs } from "./cvs";

export const educations = pgTable(
  "educations",
  {
    id: serial("id").primaryKey(),
    cvId: integer("cv_id")
      .references(() => cvs.id)
      .notNull(),
    degree: varchar("degree", { length: 255 }).notNull(),
    school: varchar("school", { length: 255 }).notNull(),
    location: varchar("location", { length: 255 }).notNull(),
    startDate: varchar("start_date", { length: 255 }).notNull(),
    endDate: varchar("end_date", { length: 255 }),
    current: boolean("current").notNull().default(false),
    order: serial("order").notNull(),
  },
  (table) => ({
    cvIdIdx: index("educations_cv_id_idx").on(table.cvId),
  })
);

export const educationRelations = relations(educations, ({ one }) => ({
  cv: one(cvs, {
    fields: [educations.cvId],
    references: [cvs.id],
  }),
}));

export type Education = typeof educations.$inferSelect;
export type NewEducation = typeof educations.$inferInsert;
