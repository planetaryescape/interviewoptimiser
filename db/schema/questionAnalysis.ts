import { relations } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";
import { reports } from "./reports";

export const questionAnalysis = pgTable(
  "question_analysis",
  (p) => ({
    id: p.serial().primaryKey(),
    reportId: p
      .integer()
      .references(() => reports.id)
      .notNull(),
    question: p.text().notNull(),
    analysis: p.text().notNull(),
    score: p.integer().notNull().default(0),
    isKeyQuestion: p.boolean().notNull().default(true),
    createdAt: p.timestamp().defaultNow().notNull(),
    updatedAt: p.timestamp().defaultNow().notNull(),
  }),
  (questionAnalysis) => ({
    reportIdIdx: index("question_analysis_report_id_idx").on(questionAnalysis.reportId),
  })
);

export const questionAnalysisRelations = relations(questionAnalysis, ({ one }) => ({
  report: one(reports, {
    fields: [questionAnalysis.reportId],
    references: [reports.id],
  }),
}));

export type QuestionAnalysis = typeof questionAnalysis.$inferSelect;
export type NewQuestionAnalysis = typeof questionAnalysis.$inferInsert;
