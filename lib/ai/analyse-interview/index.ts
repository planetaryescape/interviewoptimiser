import * as Sentry from "@sentry/nextjs";
import { logger } from "~/lib/logger";
import type { InterviewReport } from "./schemas";
import { analyzeActionableNextSteps } from "./sections/actionable-next-steps";
import { analyzeAdaptability } from "./sections/adaptability";
import { analyzeAreasForImprovement } from "./sections/areas-for-improvement";
import { analyzeAreasOfStrength } from "./sections/areas-of-strength";
import { analyzeCommunicationSkills } from "./sections/communication-skills";
import { analyzeFitnessForRole } from "./sections/fitness-for-role";
import { analyzeGeneralAssessment } from "./sections/general-assessment";
import { analyzeProblemSolvingSkills } from "./sections/problem-solving-skills";
import { analyzeKeyQuestions } from "./sections/question-analysis";
import { analyzeSpeakingSkills } from "./sections/speaking-skills";
import { analyzeTeamwork } from "./sections/teamwork";
import { analyzeTechnicalKnowledge } from "./sections/technical-knowledge";
import type { AnalyseInterviewParams, QuestionAnalysisData } from "./types";
import { combineUsage } from "./types";
import { extractKeyQuestions, processTranscript } from "./utils";

/**
 * Orchestrates the analysis of an interview by splitting it into focused sections
 * Each section is analyzed in parallel for more detailed and thorough results
 *
 * @param params - Object containing all parameters for the analysis
 * @returns A structured report with scores and analysis along with usage information and question analyses
 */
export async function analyseInterview({
  model,
  job,
  transcriptString,
  userEmail,
  structuredCV,
  structuredJobDescription,
  structuredCandidateDetails,
  interview,
}: AnalyseInterviewParams): Promise<{
  data: InterviewReport;
  questionAnalyses: QuestionAnalysisData[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}> {
  logger.info("Orchestrating interview analysis across specialized sections");

  try {
    // Process the transcript
    const transcript = processTranscript(transcriptString);

    // Extract key questions if available
    const keyQuestions = extractKeyQuestions(interview);

    // Prepare common parameters for all analyzers
    const commonParams = {
      model,
      transcript,
      userEmail,
      structuredCV,
      structuredJobDescription,
      structuredCandidateDetails,
      cvText: job.submittedCVText,
      jobDescriptionText: job.jobDescriptionText,
      additionalInfo: job.additionalInfo ?? undefined,
    };

    // Run all section analyses in parallel for better performance
    const [
      fitnessForRoleResult,
      speakingSkillsResult,
      communicationSkillsResult,
      problemSolvingSkillsResult,
      technicalKnowledgeResult,
      teamworkResult,
      adaptabilityResult,
      areasOfStrengthResult,
      areasForImprovementResult,
      actionableNextStepsResult,
      keyQuestionsResult,
    ] = await Promise.all([
      analyzeFitnessForRole(commonParams),
      analyzeSpeakingSkills(commonParams),
      analyzeCommunicationSkills(commonParams),
      analyzeProblemSolvingSkills(commonParams),
      analyzeTechnicalKnowledge(commonParams),
      analyzeTeamwork(commonParams),
      analyzeAdaptability(commonParams),
      analyzeAreasOfStrength(commonParams),
      analyzeAreasForImprovement(commonParams),
      analyzeActionableNextSteps(commonParams),
      // Only analyze key questions if they exist
      keyQuestions && keyQuestions.length > 0
        ? analyzeKeyQuestions(commonParams, keyQuestions)
        : Promise.resolve({
            data: [],
            usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          }),
    ]);

    // Prepare section results for the general assessment
    const sectionResults = {
      fitnessForRole: fitnessForRoleResult.data,
      speakingSkills: speakingSkillsResult.data,
      communicationSkills: communicationSkillsResult.data,
      problemSolvingSkills: problemSolvingSkillsResult.data,
      technicalKnowledge: technicalKnowledgeResult.data,
      teamwork: teamworkResult.data,
      adaptability: adaptabilityResult.data,
      areasOfStrength: areasOfStrengthResult.data,
      areasForImprovement: areasForImprovementResult.data,
      actionableNextSteps: actionableNextStepsResult.data,
    };

    // Generate general assessment based on all section results
    const generalAssessmentResult = await analyzeGeneralAssessment({
      ...commonParams,
      sectionResults,
    });

    // Combine all results into a single report
    const combinedReport = {
      ...generalAssessmentResult.data,
      ...fitnessForRoleResult.data,
      ...speakingSkillsResult.data,
      ...communicationSkillsResult.data,
      ...problemSolvingSkillsResult.data,
      ...technicalKnowledgeResult.data,
      ...teamworkResult.data,
      ...adaptabilityResult.data,
      ...areasOfStrengthResult.data,
      ...areasForImprovementResult.data,
      ...actionableNextStepsResult.data,
    };

    // Combine usage data
    const usage = combineUsage([
      generalAssessmentResult.usage,
      fitnessForRoleResult.usage,
      speakingSkillsResult.usage,
      communicationSkillsResult.usage,
      problemSolvingSkillsResult.usage,
      technicalKnowledgeResult.usage,
      teamworkResult.usage,
      adaptabilityResult.usage,
      areasOfStrengthResult.usage,
      areasForImprovementResult.usage,
      actionableNextStepsResult.usage,
      keyQuestionsResult.usage,
    ]);

    return {
      data: combinedReport as InterviewReport,
      questionAnalyses: keyQuestionsResult.data as QuestionAnalysisData[],
      usage,
    };
  } catch (error) {
    // Log the error and rethrow it
    Sentry.withScope((scope) => {
      scope.setExtra("context", "analyseInterview");
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });
    logger.error(
      { message: error instanceof Error ? error.message : error, error },
      "Error orchestrating interview analysis"
    );
    throw error;
  }
}
