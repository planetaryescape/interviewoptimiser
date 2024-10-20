import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
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

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  submittedCVText: text("submitted_cv_text").notNull(),
  jobDescriptionText: text("job_description_text").notNull(),
  additionalInfo: text("additional_info"),
  transcript: text("transcript"),
  duration: integer("duration").notNull().default(15),
  type: interviewTypeEnum("type").notNull().default("behavioral"),
  candidate: text("candidate"),
  company: text("company"),
  role: text("role"),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const interviewRelations = relations(interviews, ({ one }) => ({
  user: one(users, {
    fields: [interviews.userId],
    references: [users.id],
  }),
  report: one(reports, {
    fields: [interviews.id],
    references: [reports.interviewId],
  }),
}));

export type Interview = typeof interviews.$inferSelect;
export type NewInterview = typeof interviews.$inferInsert;
