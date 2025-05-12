import { relations } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";
import { jobs } from "./jobs";

export const candidateDetails = pgTable(
  "candidate_details",
  (p) => ({
    id: p.serial().primaryKey(),
    jobId: p
      .integer()
      .references(() => jobs.id, { onDelete: "cascade" })
      .notNull(),
    name: p.text().notNull(),
    email: p.text(),
    phone: p.text(),
    location: p.text(),
    currentRole: p.text(),
    professionalSummary: p.text(),
    linkedinUrl: p.text(),
    portfolioUrl: p.text(),
    otherUrls: p.text().array(),
    createdAt: p.timestamp().defaultNow().notNull(),
    updatedAt: p.timestamp().defaultNow().notNull(),
  }),
  (candidateDetails) => [index("candidate_details_job_id_idx").on(candidateDetails.jobId)]
);

export const candidateDetailsRelations = relations(candidateDetails, ({ one }) => ({
  job: one(jobs, {
    fields: [candidateDetails.jobId],
    references: [jobs.id],
  }),
}));

export type CandidateDetail = typeof candidateDetails.$inferSelect;
export type NewCandidateDetail = typeof candidateDetails.$inferInsert;
