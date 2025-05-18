import { getUserFromClerkId } from "@/lib/auth";
import { auth } from "@clerk/nextjs/server";
import { and, avg, desc, eq, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/db";
import { interviews, jobs, reports } from "~/db/schema";

export const dynamic = "force-dynamic";

// Define a union type for all possible score columns
type ReportScoreColumn =
  | typeof reports.overallScore
  | typeof reports.communicationSkillsScore
  | typeof reports.fitnessForRoleScore
  | typeof reports.speakingSkillsScore
  | typeof reports.problemSolvingSkillsScore
  | typeof reports.technicalKnowledgeScore
  | typeof reports.teamworkScore
  | typeof reports.adaptabilityScore;

/**
 * Calculates the average of a specific score column from a given set of report IDs.
 * @param scoreColumn - The Drizzle ORM column object for the score.
 * @param reportIds - An array of report IDs to calculate the average for.
 * @returns The average score, or 0 if no reports are found or reportIds is empty.
 */
async function calculateAverageScore(
  scoreColumn: ReportScoreColumn,
  reportIds: number[]
): Promise<number> {
  if (!reportIds || reportIds.length === 0) {
    return 0;
  }
  const result = await db
    .select({ value: avg(scoreColumn) })
    .from(reports)
    .where(and(eq(reports.isCompleted, true), inArray(reports.id, reportIds)));

  return Number(result[0]?.value) || 0;
}

export async function GET() {
  try {
    const authResult = await auth();
    const clerkUserId = authResult.userId;

    if (!clerkUserId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Get internal DB user ID from Clerk ID
    const { id: dbUserId } = await getUserFromClerkId(clerkUserId);

    if (!dbUserId) {
      // Handle case where user is authenticated with Clerk but not found in local DB
      return NextResponse.json(
        { success: false, message: "User not found in application database." },
        { status: 404 }
      );
    }

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

    const recentCompletedReportIds = recentCompletedInterviewsWithReports.map((r) => r.reportId);

    const scoreFields: { [key: string]: ReportScoreColumn } = {
      overallScore: reports.overallScore,
      communicationSkillsScore: reports.communicationSkillsScore,
      fitnessForRoleScore: reports.fitnessForRoleScore,
      speakingSkillsScore: reports.speakingSkillsScore,
      problemSolvingSkillsScore: reports.problemSolvingSkillsScore,
      technicalKnowledgeScore: reports.technicalKnowledgeScore,
      teamworkScore: reports.teamworkScore,
      adaptabilityScore: reports.adaptabilityScore,
    };

    const last3InterviewsScores: { [key: string]: number } = {};
    const allTimeScores: { [key: string]: number } = {};

    for (const [key, field] of Object.entries(scoreFields)) {
      last3InterviewsScores[key] = await calculateAverageScore(field, recentCompletedReportIds);
      allTimeScores[key] = await calculateAverageScore(field, allCompletedReportIds);
    }

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
    console.error("Error fetching dashboard summary:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard summary.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
