import { relations } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";
import { interviews } from "./interviews";

export const candidateDetails = pgTable(
  "candidate_details",
  (p) => ({
    id: p.serial().primaryKey(),
    interviewId: p
      .integer()
      .references(() => interviews.id)
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
  (candidateDetails) => ({
    interviewIdIdx: index("candidate_details_interview_id_idx").on(candidateDetails.interviewId),
  })
);

export const candidateDetailsRelations = relations(candidateDetails, ({ one }) => ({
  interview: one(interviews, {
    fields: [candidateDetails.interviewId],
    references: [interviews.id],
  }),
}));

export type CandidateDetail = typeof candidateDetails.$inferSelect;
export type NewCandidateDetail = typeof candidateDetails.$inferInsert;
