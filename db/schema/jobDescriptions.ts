import { relations } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";
import { interviews } from "./interviews";

export const jobDescriptions = pgTable(
  "job_descriptions",
  (p) => ({
    id: p.serial().primaryKey(),
    interviewId: p
      .integer()
      .references(() => interviews.id)
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
    createdAt: p.timestamp().defaultNow().notNull(),
    updatedAt: p.timestamp().defaultNow().notNull(),
  }),
  (jobDescriptions) => ({
    interviewIdIdx: index("job_descriptions_interview_id_idx").on(jobDescriptions.interviewId),
  })
);

export const jobDescriptionsRelations = relations(jobDescriptions, ({ one }) => ({
  interview: one(interviews, {
    fields: [jobDescriptions.interviewId],
    references: [interviews.id],
  }),
}));

export type JobDescription = typeof jobDescriptions.$inferSelect;
export type NewJobDescription = typeof jobDescriptions.$inferInsert;
