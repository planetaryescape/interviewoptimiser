import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { interviews } from "./interviews";
import { pageSettings } from "./pageSettings";

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  interviewId: integer("interview_id")
    .references(() => interviews.id)
    .notNull()
    .unique(),
  generalAssessment: text("general_assessment").notNull(),
  overallScore: integer("overall_score").notNull(),
  speakingSkills: text("speaking_skills").notNull(),
  speakingSkillsScore: integer("speaking_skills_score").notNull(),
  communicationSkills: text("communication_skills").notNull(),
  communicationSkillsScore: integer("communication_skills_score").notNull(),
  problemSolvingSkills: text("problem_solving_skills").notNull(),
  problemSolvingSkillsScore: integer("problem_solving_skills_score").notNull(),
  technicalKnowledge: text("technical_knowledge").notNull(),
  technicalKnowledgeScore: integer("technical_knowledge_score").notNull(),
  teamwork: text("teamwork").notNull(),
  teamworkScore: integer("teamwork_score").notNull(),
  adaptability: text("adaptability").notNull(),
  adaptabilityScore: integer("adaptability_score").notNull(),
  areasOfStrength: text("areas_of_strength").notNull(),
  areasForImprovement: text("areas_for_improvement").notNull(),
  actionableNextSteps: text("actionable_next_steps").notNull(),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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
