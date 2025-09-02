import { withAuthAsync } from "@/lib/auth-middleware";
import { and, avg, desc, eq, inArray, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/db";
import { interviews, jobs, reports } from "~/db/schema";
import { logger } from "~/lib/logger";

export const dynamic = "force-dynamic";

/**
 * Calculates all average scores for a given set of report IDs in a single query.
 * @param reportIds - An array of report IDs to calculate the averages for.
 * @returns An object containing all average scores.
 */
async function calculateAllAverageScores(reportIds: number[]): Promise<{ [key: string]: number }> {
  if (!reportIds || reportIds.length === 0) {
    return {
      overallScore: 0,
      communicationSkillsScore: 0,
      fitnessForRoleScore: 0,
      speakingSkillsScore: 0,
      problemSolvingSkillsScore: 0,
      technicalKnowledgeScore: 0,
      teamworkScore: 0,
      adaptabilityScore: 0,
    };
  }

  const result = await db
    .select({
      overallScore: avg(reports.overallScore),
      communicationSkillsScore: avg(reports.communicationSkillsScore),
      fitnessForRoleScore: avg(reports.fitnessForRoleScore),
      speakingSkillsScore: avg(reports.speakingSkillsScore),
      problemSolvingSkillsScore: avg(reports.problemSolvingSkillsScore),
      technicalKnowledgeScore: avg(reports.technicalKnowledgeScore),
      teamworkScore: avg(reports.teamworkScore),
      adaptabilityScore: avg(reports.adaptabilityScore),
    })
    .from(reports)
    .where(and(eq(reports.isCompleted, true), inArray(reports.id, reportIds)));

  const scores = result[0];
  return {
    overallScore: Number(scores?.overallScore) || 0,
    communicationSkillsScore: Number(scores?.communicationSkillsScore) || 0,
    fitnessForRoleScore: Number(scores?.fitnessForRoleScore) || 0,
    speakingSkillsScore: Number(scores?.speakingSkillsScore) || 0,
    problemSolvingSkillsScore: Number(scores?.problemSolvingSkillsScore) || 0,
    technicalKnowledgeScore: Number(scores?.technicalKnowledgeScore) || 0,
    teamworkScore: Number(scores?.teamworkScore) || 0,
    adaptabilityScore: Number(scores?.adaptabilityScore) || 0,
  };
}

export async function GET(request: NextRequest) {
  return withAuthAsync(
    async (_request, { user }) => {
      try {
        const dbUserId = user.id;

        // 1. Job Stats & Recent Jobs (User-Specific)
        const totalJobsResult = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(jobs)
          .where(eq(jobs.userId, dbUserId));
        const totalJobs = totalJobsResult[0]?.count || 0;

        const recentJobsData = await db
          .select({
            id: jobs.id,
            role: jobs.role,
            company: jobs.company,
            createdAt: jobs.createdAt,
          })
          .from(jobs)
          .where(eq(jobs.userId, dbUserId))
          .orderBy(desc(jobs.createdAt))
          .limit(3);

        // 2. Interview Stats & Recent Interviews (User-Specific)
        const totalInterviewsResult = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(interviews)
          .innerJoin(jobs, eq(interviews.jobId, jobs.id))
          .where(eq(jobs.userId, dbUserId));
        const totalInterviews = totalInterviewsResult[0]?.count || 0;

        const recentInterviewsData = await db
          .select({
            interviewId: interviews.id,
            reportId: reports.id,
            jobRole: jobs.role,
            interviewType: interviews.type,
            interviewCreatedAt: interviews.createdAt,
            jobId: jobs.id,
          })
          .from(interviews)
          .leftJoin(jobs, eq(interviews.jobId, jobs.id))
          .leftJoin(reports, and(eq(interviews.id, reports.interviewId)))
          .where(and(eq(jobs.userId, dbUserId), eq(reports.isCompleted, true)))
          .orderBy(desc(interviews.createdAt))
          .limit(3);

        const practiceTimeResult = await db
          .select({ totalSeconds: sql<number>`sum(${interviews.actualTime})::int` })
          .from(interviews)
          .innerJoin(jobs, eq(interviews.jobId, jobs.id))
          .innerJoin(reports, eq(interviews.id, reports.interviewId))
          .where(
            and(
              eq(jobs.userId, dbUserId),
              eq(reports.isCompleted, true),
              sql`${interviews.actualTime} IS NOT NULL`
            )
          );

        const minutesSpentPracticing = Math.floor(practiceTimeResult[0]?.totalSeconds || 0);

        // 4. Average Scores (User-Specific)
        const allCompletedReportIds = (
          await db
            .select({ id: reports.id })
            .from(reports)
            .innerJoin(interviews, eq(reports.interviewId, interviews.id))
            .innerJoin(jobs, eq(interviews.jobId, jobs.id))
            .where(and(eq(reports.isCompleted, true), eq(jobs.userId, dbUserId)))
        ).map((r) => r.id);

        const recentCompletedInterviewsWithReports = await db
          .select({ reportId: reports.id })
          .from(interviews)
          .innerJoin(jobs, eq(interviews.jobId, jobs.id))
          .innerJoin(reports, eq(interviews.id, reports.interviewId))
          .where(and(eq(reports.isCompleted, true), eq(jobs.userId, dbUserId)))
          .orderBy(desc(interviews.createdAt))
          .limit(3);

        const recentCompletedReportIds = recentCompletedInterviewsWithReports.map(
          (r) => r.reportId
        );

        const [last3InterviewsScores, allTimeScores] = await Promise.all([
          calculateAllAverageScores(recentCompletedReportIds),
          calculateAllAverageScores(allCompletedReportIds),
        ]);

        return NextResponse.json({
          success: true,
          data: {
            jobStats: { totalJobs },
            recentJobs: recentJobsData,
            interviewStats: {
              totalInterviews,
              minutesSpentPracticing,
            },
            recentInterviews: recentInterviewsData,
            averageScores: {
              last3Interviews: last3InterviewsScores,
              allTime: allTimeScores,
            },
          },
        });
      } catch (error) {
        logger.error({ error }, "Error fetching dashboard summary");
        return NextResponse.json(
          {
            success: false,
            message: "Failed to fetch dashboard summary.",
            error: error instanceof Error ? error.message : String(error),
          },
          { status: 500 }
        );
      }
    },
    request,
    undefined,
    { routeName: "GET /api/dashboard/summary" }
  );
}
