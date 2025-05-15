import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { reports } from "~/db/schema";
import { questionAnalysis } from "~/db/schema/questionAnalysis";

// Base report schema
const ReportSchema = createInsertSchema(reports);

// Question analysis schema
export const QuestionAnalysisSchema = createInsertSchema(questionAnalysis).omit({
  id: true,
  reportId: true,
  createdAt: true,
  updatedAt: true,
});

// Fitness for role schema
export const FitnessForRoleSchema = z.object({
  fitnessForRole: z
    .string()
    .describe(
      "Assessment of the candidate's fitness for the role. Return empty string if evaluation cannot be made."
    ),
  fitnessForRoleScore: z
    .number()
    .describe("Score for fitness for the role out of 100. Return 0 if score cannot be determined."),
});

// Speaking skills schema
export const SpeakingSkillsSchema = z.object({
  speakingSkills: z
    .string()
    .describe(
      "Assessment of the candidate's speaking skills. Return empty string if evaluation cannot be made."
    ),
  speakingSkillsScore: z
    .number()
    .describe("Score for speaking skills out of 100. Return 0 if score cannot be determined."),
});

// Communication skills schema
export const CommunicationSkillsSchema = z.object({
  communicationSkills: z
    .string()
    .describe(
      "Assessment of the candidate's communication skills. Return empty string if evaluation cannot be made."
    ),
  communicationSkillsScore: z
    .number()
    .describe("Score for communication skills out of 100. Return 0 if score cannot be determined."),
});

// Problem solving skills schema
export const ProblemSolvingSkillsSchema = z.object({
  problemSolvingSkills: z
    .string()
    .describe(
      "Assessment of the candidate's problem-solving skills. Return empty string if evaluation cannot be made."
    ),
  problemSolvingSkillsScore: z
    .number()
    .describe(
      "Score for problem-solving skills out of 100. Return 0 if score cannot be determined."
    ),
});

// Technical knowledge schema
export const TechnicalKnowledgeSchema = z.object({
  technicalKnowledge: z
    .string()
    .describe(
      "Assessment of the candidate's technical knowledge. Return empty string if evaluation cannot be made."
    ),
  technicalKnowledgeScore: z
    .number()
    .describe("Score for technical knowledge out of 100. Return 0 if score cannot be determined."),
});

// Teamwork schema
export const TeamworkSchema = z.object({
  teamwork: z
    .string()
    .describe(
      "Assessment of the candidate's teamwork abilities. Return empty string if evaluation cannot be made."
    ),
  teamworkScore: z
    .number()
    .describe("Score for teamwork abilities out of 100. Return 0 if score cannot be determined."),
});

// Adaptability schema
export const AdaptabilitySchema = z.object({
  adaptability: z
    .string()
    .describe(
      "Assessment of the candidate's adaptability. Return empty string if evaluation cannot be made."
    ),
  adaptabilityScore: z
    .number()
    .describe("Score for adaptability out of 100. Return 0 if score cannot be determined."),
});

// Areas of strength schema
export const AreasOfStrengthSchema = z.object({
  areasOfStrength: z
    .array(z.string().describe("Specific area of strength"))
    .describe(
      "List of the candidate's areas of strength. Return empty array if none can be identified."
    ),
});

// Areas for improvement schema
export const AreasForImprovementSchema = z.object({
  areasForImprovement: z
    .array(z.string().describe("Specific area for improvement"))
    .describe(
      "List of areas where the candidate can improve. Return empty array if none can be identified."
    ),
});

// Actionable next steps schema
export const ActionableNextStepsSchema = z.object({
  actionableNextSteps: z
    .array(z.string().describe("Specific actionable step for improvement"))
    .describe(
      "List of actionable steps for the candidate to improve. Return empty array if none can be identified."
    ),
});

// General assessment schema
export const GeneralAssessmentSchema = z.object({
  generalAssessment: z
    .string()
    .describe(
      "Overall assessment of the interview performance. Return empty string if evaluation cannot be made."
    ),
  overallScore: z
    .number()
    .describe("Overall score of the interview out of 100. Return 0 if score cannot be determined."),
  candidateName: z.string().describe("Name of the candidate. Return empty string if not found."),
  companyName: z
    .string()
    .describe("Name of the company being applied to. Return empty string if not found."),
  roleName: z
    .string()
    .describe("Name of the role being applied for. Return empty string if not found."),
});

// Combined report schema (full report with all sections)
export const ExtendedReportSchema = z.object({
  ...GeneralAssessmentSchema.shape,
  ...FitnessForRoleSchema.shape,
  ...SpeakingSkillsSchema.shape,
  ...CommunicationSkillsSchema.shape,
  ...ProblemSolvingSkillsSchema.shape,
  ...TechnicalKnowledgeSchema.shape,
  ...TeamworkSchema.shape,
  ...AdaptabilitySchema.shape,
  ...AreasOfStrengthSchema.shape,
  ...AreasForImprovementSchema.shape,
  ...ActionableNextStepsSchema.shape,
});

// Types for each schema
export type FitnessForRoleAnalysis = z.infer<typeof FitnessForRoleSchema>;
export type SpeakingSkillsAnalysis = z.infer<typeof SpeakingSkillsSchema>;
export type CommunicationSkillsAnalysis = z.infer<typeof CommunicationSkillsSchema>;
export type ProblemSolvingSkillsAnalysis = z.infer<typeof ProblemSolvingSkillsSchema>;
export type TechnicalKnowledgeAnalysis = z.infer<typeof TechnicalKnowledgeSchema>;
export type TeamworkAnalysis = z.infer<typeof TeamworkSchema>;
export type AdaptabilityAnalysis = z.infer<typeof AdaptabilitySchema>;
export type AreasOfStrengthAnalysis = z.infer<typeof AreasOfStrengthSchema>;
export type AreasForImprovementAnalysis = z.infer<typeof AreasForImprovementSchema>;
export type ActionableNextStepsAnalysis = z.infer<typeof ActionableNextStepsSchema>;
export type GeneralAssessmentAnalysis = z.infer<typeof GeneralAssessmentSchema>;
export type QuestionAnalysisType = z.infer<typeof QuestionAnalysisSchema>;
export type InterviewReport = z.infer<typeof ExtendedReportSchema>;
