import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { cvs } from "./cvs";
import { feedback } from "./feedback";
import { sectionsOrder } from "./sectionsOrder";
import { users } from "./users";

export const optimizations = pgTable("optimizations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  submittedCVText: text("submitted_cv_text").notNull(),
  jobDescriptionText: text("job_description_text").notNull(),
  additionalInfo: text("additional_info"),
  isCvComplete: boolean("is_cv_complete").default(false),
  isCoverLetterComplete: boolean("is_cover_letter_complete").default(false),
  cvError: boolean("cv_error").default(false),
  coverLetterError: boolean("cover_letter_error").default(false),
  score: integer("score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  candidate: text("candidate"),
  company: text("company"),
  role: text("role"),
});

export const optimizationRelations = relations(
  optimizations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [optimizations.userId],
      references: [users.id],
    }),
    sectionsOrder: one(sectionsOrder, {
      fields: [optimizations.id],
      references: [sectionsOrder.optimizationId],
    }),
    cv: one(cvs, {
      fields: [optimizations.id],
      references: [cvs.optimizationId],
    }),
    feedback: many(feedback),
  })
);

export type Optimization = typeof optimizations.$inferSelect;
export type NewOptimization = typeof optimizations.$inferInsert;
