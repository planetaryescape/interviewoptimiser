import { relations } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";
import { interviews } from "./interviews";
import { pageSettings } from "./pageSettings";

export const reports = pgTable(
  "reports",
  (p) => ({
    id: p.serial().primaryKey(),
    interviewId: p
      .integer()
      .references(() => interviews.id)
      .notNull(),
    generalAssessment: p.text().notNull(),
    overallScore: p.integer().notNull(),
    fitnessForRole: p.text().notNull().default(""),
    fitnessForRoleScore: p.integer().notNull().default(0),
    speakingSkills: p.text().notNull(),
    speakingSkillsScore: p.integer().notNull(),
    communicationSkills: p.text().notNull(),
    communicationSkillsScore: p.integer().notNull(),
    problemSolvingSkills: p.text().notNull(),
    problemSolvingSkillsScore: p.integer().notNull(),
    technicalKnowledge: p.text().notNull(),
    technicalKnowledgeScore: p.integer().notNull(),
    teamwork: p.text().notNull(),
    teamworkScore: p.integer().notNull(),
    adaptability: p.text().notNull(),
    adaptabilityScore: p.integer().notNull(),
    areasOfStrength: p.text().notNull(),
    areasForImprovement: p.text().notNull(),
    actionableNextSteps: p.text().notNull(),
    isPublic: p.boolean().notNull().default(false),
    isCompleted: p.boolean().notNull().default(false),
    createdAt: p.timestamp().defaultNow().notNull(),
    updatedAt: p.timestamp().defaultNow().notNull(),
  }),
  (reports) => ({
    interviewIdIdx: index("reports_interview_id_idx").on(reports.interviewId),
  })
);

export const reportRelations = relations(reports, ({ one }) => ({
  interview: one(interviews, {
    fields: [reports.interviewId],
    references: [interviews.id],
  }),
  pageSettings: one(pageSettings, {
    fields: [reports.id],
    references: [pageSettings.reportId],
  }),
}));

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
