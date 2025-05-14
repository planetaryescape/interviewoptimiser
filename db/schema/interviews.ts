import { relations } from "drizzle-orm";
import { index, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { jobs } from "./jobs";
import { reports } from "./reports";

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
    jobId: p
      .integer()
      .references(() => jobs.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    customSessionId: p.text(),
    transcript: p.text(),
    chatGroupId: p.text().notNull(),
    humeChatId: p.text().notNull().unique(),
    requestId: p.text().unique(),
    duration: p.integer().notNull().default(15),
    type: interviewTypeEnum().notNull().default("behavioral"),
    keyQuestions: p.text().array(),
    actualTime: p.integer(),
    createdAt: p.timestamp().defaultNow().notNull(),
    updatedAt: p.timestamp().defaultNow().notNull(),
  }),
  (interviews) => [index("interviews_job_id_idx").on(interviews.jobId)]
);

export const interviewRelations = relations(interviews, ({ one }) => ({
  job: one(jobs, {
    fields: [interviews.jobId],
    references: [jobs.id],
  }),
  report: one(reports, {
    fields: [interviews.id],
    references: [reports.interviewId],
  }),
}));

export type Interview = typeof interviews.$inferSelect;
export type NewInterview = typeof interviews.$inferInsert;
export type InterviewType = (typeof interviewTypeEnum.enumValues)[number];
