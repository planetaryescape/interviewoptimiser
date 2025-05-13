import { relations } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";
import { candidateDetails } from "./candidateDetails";
import { interviews } from "./interviews";
import { jobDescriptions } from "./jobDescriptions";
import { users } from "./users";

export const jobs = pgTable(
  "jobs",
  (p) => ({
    id: p.serial().primaryKey(),
    userId: p.integer().references(() => users.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),
    submittedCVText: p.text().notNull(),
    jobDescriptionText: p.text().notNull(),
    additionalInfo: p.text(),
    candidate: p.text(),
    company: p.text(),
    role: p.text(),
    completed: p.boolean().notNull().default(false),
    createdAt: p.timestamp().defaultNow().notNull(),
    updatedAt: p.timestamp().defaultNow().notNull(),
  }),
  (jobs) => [index("jobs_user_id_idx").on(jobs.userId)]
);

export const jobRelations = relations(jobs, ({ one, many }) => ({
  user: one(users, {
    fields: [jobs.userId],
    references: [users.id],
  }),
  interviews: many(interviews),
  candidateDetails: one(candidateDetails, {
    fields: [jobs.id],
    references: [candidateDetails.jobId],
  }),
  jobDescription: one(jobDescriptions, {
    fields: [jobs.id],
    references: [jobDescriptions.jobId],
  }),
}));

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
