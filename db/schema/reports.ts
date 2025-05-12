import { relations } from "drizzle-orm";
import { type PgTableWithColumns, index, pgTable } from "drizzle-orm/pg-core";
import { chats } from "./chats";
import { pageSettings } from "./pageSettings";
import { questionAnalysis } from "./questionAnalysis";

export const reports: PgTableWithColumns<any> = pgTable(
  "reports",
  (p) => ({
    id: p.serial().primaryKey(),
    chatId: p
      .integer()
      .references(() => chats.id)
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
    interviewAudioUrl: p.text(),
    actionableNextSteps: p.text().notNull(),
    isPublic: p.boolean().notNull().default(false),
    isCompleted: p.boolean().notNull().default(false),
    createdAt: p.timestamp().defaultNow().notNull(),
    updatedAt: p.timestamp().defaultNow().notNull(),
  }),
  (reports) => [index("reports_chat_id_idx").on(reports.chatId)]
);

export const reportRelations = relations(reports, ({ one, many }) => ({
  pageSettings: one(pageSettings, {
    fields: [reports.id],
    references: [pageSettings.reportId],
  }),
  questionAnalyses: many(questionAnalysis),
  chat: one(chats, {
    fields: [reports.chatId],
    references: [chats.id],
  }),
}));

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
