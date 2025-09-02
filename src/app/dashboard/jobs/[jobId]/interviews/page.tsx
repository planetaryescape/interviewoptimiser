"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  BarChart2, // Added for analytics empty state
  Briefcase,
  Clock,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import { OutOfMinutesModal } from "@/components/create-optimization/OutOfMinutesModal";
import { AnimatedStatCard } from "@/components/dashboard/animated-stat-card";
import { InterviewsTable } from "@/components/dashboard/interviews-table";
import { PerformanceMetricsSection } from "@/components/dashboard/performance-metrics-section";
import { ScoreComparisonCard } from "@/components/dashboard/score-comparison-card";
import { JobDetailsSheet } from "@/components/job-details-sheet";
import { Button } from "@/components/ui/button";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getRepository } from "@/lib/data/repositoryFactory";
import type { EntityList } from "@/lib/utils/formatEntity";
import { formatInterviewType } from "@/utils/formatters/format-interview-type";
import type { InferResultType } from "~/db/helpers";
import type { Job } from "~/db/schema";

type InterviewWithReport = InferResultType<
  "interviews",
  {
    report: true;
  }
>;

interface FetchedReportPartial {
  id: number;
  interviewId: number;
  overallScore: number;
  fitnessForRoleScore: number;
  speakingSkillsScore: number;
  communicationSkillsScore: number;
  problemSolvingSkillsScore: number;
  technicalKnowledgeScore: number;
  teamworkScore: number;
  adaptabilityScore: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the score keys for consistency at module level
const SCORE_KEYS: (keyof FetchedReportPartial)[] = [
  "overallScore",
  "communicationSkillsScore",
  "fitnessForRoleScore",
  "speakingSkillsScore",
  "problemSolvingSkillsScore",
  "technicalKnowledgeScore",
  "teamworkScore",
  "adaptabilityScore",
] as const;

// Add this function to aggregate prosody data (similar to the one in the report page)
function _aggregateProsodyData(transcript: string) {
  const messages = JSON.parse(transcript || "[]");

  const prosodyTotals: { [key: string]: number } = {};
  let totalMessages = 0;

  for (const message of messages) {
    if (message.role === "user" && message.prosody) {
      totalMessages++;
      for (const [key, value] of Object.entries(message.prosody)) {
        prosodyTotals[key] = (prosodyTotals[key] || 0) + (value as number);
      }
    }
  }

  const result = Object.entries(prosodyTotals)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round((value / totalMessages) * 100),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return result;
}

export default function JobReportsPage(props: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(props.params);
  const router = useRouter();
  const [isOutOfMinutesDialogOpen, setIsOutOfMinutesDialogOpen] = useState(false);

  const {
    data: interviewsData,
    isLoading: interviewsLoading,
    error: interviewsError,
  } = useQuery<EntityList<InterviewWithReport>>({
    queryKey: ["job-interviews", jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}/interviews`);
      if (!response.ok) {
        throw new Error("Failed to fetch interviews");
      }
      return response.json();
    },
    refetchInterval: 3000,
  });

  const interviews = interviewsData?.data || [];

  const {
    data: jobData,
    isLoading: jobIsLoading,
    error: jobError,
  } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const jobRepo = await getRepository<Job>("jobs");
      return await jobRepo.getById(jobId);
    },
  });
  const job = jobData?.data; // Extracted job data

  const { totalPracticeMinutesThisJob, latestInterviewScoresThisJob, averageScoresThisJob } =
    useMemo(() => {
      if (!interviews.length) {
        const zeroScores = SCORE_KEYS.reduce(
          (acc, key) => {
            acc[key] = 0;
            return acc;
          },
          {} as Record<(typeof SCORE_KEYS)[number], number>
        );
        return {
          totalPracticeMinutesThisJob: 0,
          latestInterviewScoresThisJob: zeroScores,
          averageScoresThisJob: zeroScores,
        };
      }

      const totalPracticeMinutesThisJob = interviews.reduce((sum, interview) => {
        // Use actualTime from the interview data for duration, assuming it's in seconds
        const durationInSeconds = interview.data.actualTime;
        return sum + (typeof durationInSeconds === "number" ? durationInSeconds : 0);
      }, 0);

      const sortedInterviews = [...interviews].sort(
        (a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime()
      );
      const latestInterview = sortedInterviews[0];
      const latestInterviewScoresThisJob = SCORE_KEYS.reduce(
        (acc, key) => {
          const report = latestInterview?.data.report as FetchedReportPartial | undefined;
          const scoreValue = report?.[key as keyof FetchedReportPartial];
          acc[key as string] = typeof scoreValue === "number" ? scoreValue : 0;
          return acc;
        },
        {} as Record<string, number>
      );

      const scoreSums = SCORE_KEYS.reduce(
        (acc, key) => {
          acc[key as string] = 0;
          return acc;
        },
        {} as Record<string, number>
      );
      const scoreCounts = SCORE_KEYS.reduce(
        (acc, key) => {
          acc[key as string] = 0;
          return acc;
        },
        {} as Record<string, number>
      );

      for (const interview of interviews) {
        for (const key of SCORE_KEYS) {
          const report = interview.data.report as FetchedReportPartial | undefined;
          const score = report?.[key as keyof FetchedReportPartial];
          if (typeof score === "number") {
            scoreSums[key as string] += score;
            scoreCounts[key as string]++;
          }
        }
      }

      const averageScoresThisJob = SCORE_KEYS.reduce(
        (acc, key) => {
          if (scoreCounts[key as string] > 0) {
            acc[key as string] = Math.round(scoreSums[key as string] / scoreCounts[key as string]);
          } else {
            acc[key as string] = 0;
          }
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        totalPracticeMinutesThisJob,
        latestInterviewScoresThisJob,
        averageScoresThisJob,
      };
    }, [interviews]);

  const _chartData = useMemo(() => {
    if (!interviews.length) return [];

    const prepared = interviews
      .sort((a, b) => new Date(a.data.createdAt!).getTime() - new Date(b.data.createdAt!).getTime())
      .map((interview) => ({
        date: new Date(interview.data.createdAt).toLocaleDateString(),
        technicalScore: Math.round(
          (interview.data?.report as FetchedReportPartial | undefined)?.technicalKnowledgeScore || 0
        ),
        communicationScore: Math.round(
          (interview.data?.report as FetchedReportPartial | undefined)?.communicationSkillsScore ||
            0
        ),
        problemSolvingScore: Math.round(
          (interview.data?.report as FetchedReportPartial | undefined)?.problemSolvingSkillsScore ||
            0
        ),
        teamworkScore: Math.round(
          (interview.data?.report as FetchedReportPartial | undefined)?.teamworkScore || 0
        ),
      }));

    return prepared;
  }, [interviews]);

  // Early return for loading state
  if (interviewsLoading || jobIsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <ParticleSwarmLoader />
      </div>
    );
  }

  // Early return for error state
  if (interviewsError || jobError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4 text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Page Data</h2>
        <p className="text-muted-foreground mb-4">
          There was a problem fetching the necessary information for this job's interviews. Please
          try again later.
        </p>
        <Button onClick={() => router.push("/dashboard")} variant="outline">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // Early return if job data is not available after loading and no error
  if (!job) {
    // Handle case where job data might be null after loading without error
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4 text-center">
        <Briefcase className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Job Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The requested job could not be found. It might have been deleted or the ID is incorrect.
        </p>
        <Button onClick={() => router.push("/dashboard/jobs")} variant="outline">
          Back to Jobs List
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
        {/* Navigation and Page Title */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
          <div className="flex-grow">
            <Link href="/dashboard/jobs" passHref>
              <Button variant="outline" className="mb-3">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Jobs
              </Button>
            </Link>
            <h2 className="text-3xl font-bold tracking-tight">{job?.role || "Job Interviews"}</h2>
            {job?.company && <p className="text-xl text-muted-foreground">at {job.company}</p>}
          </div>
          <div className="flex flex-shrink-0 items-center space-x-2">
            {job && <JobDetailsSheet jobId={jobId} />}
            <Button onClick={() => router.push(`/dashboard/jobs/${jobId}/interviews/new`)}>
              <Briefcase className="mr-2 h-4 w-4" /> New Interview
            </Button>
          </div>
        </div>

        {/* Key Metrics (This Job) */}
        <section>
          <h3 className="text-xl font-semibold tracking-tight mb-4">Key Metrics (This Job)</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ScoreComparisonCard
              title="Avg. Overall Score"
              Icon={Award}
              last3Score={averageScoresThisJob.overallScore}
              allTimeScore={averageScoresThisJob.overallScore}
            />
            <AnimatedStatCard
              title="Total Interviews"
              Icon={FileText}
              value={`${interviews.length}${
                interviews.length === 1 ? " interview" : " interviews"
              }`}
              description="Total interviews conducted for this job."
            />
            <AnimatedStatCard
              title="Total Practice Time"
              Icon={Clock}
              value={`${totalPracticeMinutesThisJob} min`}
              description="Combined duration of all practice interviews for this job."
            />
          </div>
        </section>

        {/* Tabs for Reports and Analytics */}
        <section className="mt-6">
          <Tabs.Root defaultValue="reports" className="space-y-4">
            <Tabs.List className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
              <Tabs.Trigger
                value="reports"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
              >
                Reports
              </Tabs.Trigger>
              <Tabs.Trigger
                value="analytics"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
              >
                Analytics
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="reports">
              {interviews.length > 0 ? (
                <InterviewsTable
                  interviews={interviews.map((interviewEntity) => ({
                    id: interviewEntity.data.id,
                    createdAt: interviewEntity.data.createdAt,
                    duration: interviewEntity.data.actualTime ?? 0,
                    type: formatInterviewType(interviewEntity.data.type ?? "General"),
                    report: interviewEntity.data.report as FetchedReportPartial | null,
                  }))}
                  jobId={jobId}
                />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-xl font-semibold">No Interviews Yet</h3>
                  <p className="text-muted-foreground">
                    Start an interview for this job to see reports here.
                  </p>
                  <Button
                    onClick={() => router.push(`/dashboard/jobs/${jobId}/interviews/new`)}
                    className="mt-4"
                  >
                    <Briefcase className="mr-2 h-4 w-4" /> Start New Interview
                  </Button>
                </div>
              )}
            </Tabs.Content>

            <Tabs.Content value="analytics">
              {interviews.length > 0 ? (
                <section>
                  <h3 className="text-xl font-semibold tracking-tight mb-4">
                    Performance Snapshot
                  </h3>
                  <PerformanceMetricsSection
                    primaryScores={latestInterviewScoresThisJob}
                    comparisonScores={averageScoresThisJob}
                    primaryScoresTitle="Latest Interview (This Job)"
                  />
                </section>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <BarChart2 className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-xl font-semibold">No Analytics Yet</h3>
                  <p className="text-muted-foreground">
                    Complete interviews for this job to see performance analytics.
                  </p>
                </div>
              )}
            </Tabs.Content>
          </Tabs.Root>
        </section>
      </div>
      <OutOfMinutesModal
        isOpen={isOutOfMinutesDialogOpen}
        onClose={() => setIsOutOfMinutesDialogOpen(false)}
        onBuyMinutes={() => router.push("/pricing")}
      />
    </ScrollArea>
  );
}
