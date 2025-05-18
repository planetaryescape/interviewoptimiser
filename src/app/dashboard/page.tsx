"use client";

import { Button } from "@/components/ui/button";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { idHandler } from "@/lib/utils/idHandler";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Brain,
  Briefcase,
  ClipboardList,
  MessageSquare,
  Plus,
  Star,
  ThumbsUp,
  TrendingUp,
  Users,
  Users2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type { Interview, Job, Report } from "~/db/schema";

import type {
  RecentInterviewItem,
  RecentJobItem,
} from "@/components/dashboard/activity-timeline-item";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { KeyMetricsSection } from "@/components/dashboard/key-metrics-section";
import { PerformanceMetricsSection } from "@/components/dashboard/performance-metrics-section";
import { RecentActivitySection } from "@/components/dashboard/recent-activity-section";

interface AverageScoreSet {
  overallScore: number;
  communicationSkillsScore: number;
  fitnessForRoleScore: number;
  speakingSkillsScore: number;
  problemSolvingSkillsScore: number;
  technicalKnowledgeScore: number;
  teamworkScore: number;
  adaptabilityScore: number;
  [key: string]: number; // For dynamic access
}

interface DashboardData {
  jobStats: { totalJobs: number };
  recentJobs: RecentJobItem[];
  interviewStats: {
    totalInterviews: number;
    minutesSpentPracticing: number;
  };
  recentInterviews: RecentInterviewItem[];
  averageScores: {
    last3Interviews: AverageScoreSet;
    allTime: AverageScoreSet;
  };
}

async function fetchDashboardSummary(): Promise<DashboardData> {
  const response = await fetch("/api/dashboard/summary");
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch dashboard summary");
  }
  const result = await response.json();
  const transformActivityDates = (activity: any) => {
    if (activity.createdAt) activity.createdAt = new Date(activity.createdAt);
    if (activity.interviewCreatedAt)
      activity.interviewCreatedAt = new Date(activity.interviewCreatedAt);
    return activity;
  };
  result.data.recentJobs = result.data.recentJobs.map(transformActivityDates);
  result.data.recentInterviews = result.data.recentInterviews.map(transformActivityDates);
  return result.data;
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery<DashboardData, Error>({
    queryKey: ["dashboardSummary"],
    queryFn: fetchDashboardSummary,
  });

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-theme(spacing.24))] items-center justify-center">
        <ParticleSwarmLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-card p-8 rounded-lg shadow-md">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Dashboard</h2>
        <p className="text-muted-foreground mb-4 text-center">
          We couldn&apos;t fetch the dashboard data. Please try again later.
        </p>
        <p className="text-sm text-red-400">Details: {error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-card p-8 rounded-lg shadow-md">
        <Briefcase className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No Data Available</h2>
        <p className="text-muted-foreground">
          There is currently no data to display on the dashboard.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/create">
            <Plus className="mr-2 h-5 w-5" /> Create First Job
          </Link>
        </Button>
      </div>
    );
  }

  const { jobStats, recentJobs, interviewStats, recentInterviews, averageScores } = data;

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8 font-sans">
      <DashboardHero />

      <div className="flex justify-end mb-6 md:mb-0 md:-mt-12 relative z-20 pr-2 md:pr-0">
        <Button asChild size="lg" className="shadow-lg">
          <Link href="/dashboard/create">
            <Plus className="mr-2 h-5 w-5" /> Create New Job
          </Link>
        </Button>
      </div>

      <KeyMetricsSection
        totalJobs={jobStats.totalJobs}
        totalInterviews={interviewStats.totalInterviews}
        minutesSpentPracticing={interviewStats.minutesSpentPracticing || 0}
      />

      <PerformanceMetricsSection
        last3InterviewsScores={averageScores.last3Interviews}
        allTimeScores={averageScores.allTime}
      />

      <RecentActivitySection recentJobs={recentJobs} recentInterviews={recentInterviews} />
    </div>
  );
}
