import { relations } from "drizzle-orm";
import { index, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { cvs } from "./cvs";

export const skills = pgTable(
  "skills",
  {
    id: serial("id").primaryKey(),
    cvId: integer("cv_id")
      .references(() => cvs.id)
      .notNull(),
    skill: varchar("skill", { length: 255 }).notNull(),
    order: serial("order").notNull(),
  },
  (table) => ({
    cvIdIdx: index("skills_cv_id_idx").on(table.cvId),
  })
);

export const skillRelations = relations(skills, ({ one }) => ({
  cv: one(cvs, {
    fields: [skills.cvId],
    references: [cvs.id],
  }),
}));

export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
