import { relations } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";
import { jobs } from "./jobs";

export const jobDescriptions = pgTable(
  "job_descriptions",
  (p) => ({
    id: p.serial().primaryKey(),
    jobId: p
      .integer()
      .references(() => jobs.id, { onDelete: "cascade" })
      .notNull(),
    company: p.text(),
    role: p.text(),
    requiredQualifications: p.text().array(),
    requiredExperience: p.text().array(),
    requiredSkills: p.text().array(),
    preferredQualifications: p.text().array(),
    preferredSkills: p.text().array(),
    responsibilities: p.text().array(),
    benefits: p.text().array(),
    location: p.text(),
    employmentType: p.text(),
    seniority: p.text(),
    industry: p.text(),
    keyTechnologies: p.text().array(),
    keywords: p.text().array(),
    keyQuestions: p.text().array(),
    createdAt: p.timestamp().defaultNow().notNull(),
    updatedAt: p.timestamp().defaultNow().notNull(),
  }),
  (jobDescriptions) => [index("job_descriptions_job_id_idx").on(jobDescriptions.jobId)]
);

export const jobDescriptionsRelations = relations(jobDescriptions, ({ one }) => ({
  job: one(jobs, {
    fields: [jobDescriptions.jobId],
    references: [jobs.id],
  }),
}));

export type JobDescription = typeof jobDescriptions.$inferSelect;
export type NewJobDescription = typeof jobDescriptions.$inferInsert;
