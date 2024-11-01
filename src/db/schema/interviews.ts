import { relations } from "drizzle-orm";
import { index, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { reports } from "./reports";
import { users } from "./users";

export const interviewTypeEnum = pgEnum("interview_type", [
  "behavioral",
  "situational",
  "technical",
  "case_study",
  "competency_based",
  "stress",
  "cultural_fit",
]);

export const interviews = pgTable(
  "interviews",
  (p) => ({
    id: p.serial().primaryKey(),
    userId: p.integer().references(() => users.id),
    submittedCVText: p.text().notNull(),
    jobDescriptionText: p.text().notNull(),
    additionalInfo: p.text(),
    transcript: p.text(),
    duration: p.integer().notNull().default(15),
    type: interviewTypeEnum().notNull().default("behavioral"),
    candidate: p.text(),
    company: p.text(),
    role: p.text(),
    completed: p.boolean().notNull().default(false),
    createdAt: p.timestamp().defaultNow().notNull(),
    updatedAt: p.timestamp().defaultNow().notNull(),
  }),
  (interviews) => ({
    userIdIdx: index("interviews_user_id_idx").on(interviews.userId),
  })
);

export const interviewRelations = relations(interviews, ({ one, many }) => ({
  user: one(users, {
    fields: [interviews.userId],
    references: [users.id],
  }),
  report: many(reports),
}));

export type Interview = typeof interviews.$inferSelect;
export type NewInterview = typeof interviews.$inferInsert;
