import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
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
  report: text("report"),
  transcript: text("transcript"),
  duration: integer("duration").notNull().default(15),
  type: interviewTypeEnum("type").notNull().default("behavioral"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  candidate: text("candidate"),
  company: text("company"),
  role: text("role"),
});

export const interviewRelations = relations(interviews, ({ one }) => ({
  user: one(users, {
    fields: [interviews.userId],
    references: [users.id],
  }),
}));

export type Interview = typeof interviews.$inferSelect;
export type NewInterview = typeof interviews.$inferInsert;
