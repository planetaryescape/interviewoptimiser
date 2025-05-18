"use client";

import { OutOfMinutesModal } from "@/components/create-optimization/OutOfMinutesModal";
import { PerformanceMetricsSection } from "@/components/dashboard/performance-metrics-section"; // Added import
import { JobDetailsSheet } from "@/components/job-details-sheet";
import { ReportCard } from "@/components/report-card";
import { Button } from "@/components/ui/button";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getRepository } from "@/lib/data/repositoryFactory";
import type { EntityList } from "@/lib/utils/formatEntity";
import * as Tabs from "@radix-ui/react-tabs";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle, // For error display
  BarChart2, // Keep for PerformanceMetricsSection if it uses it or similar
  Briefcase,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  MessageSquare, // Keep for PerformanceMetricsSection if it uses it
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { InferResultType } from "~/db/helpers";
import type { Report as FullReportType, Job } from "~/db/schema"; // Renamed to FullReportType

type InterviewWithReport = InferResultType<
  "interviews",
  {
    report: true; // This indicates the relation is loaded, but not its detailed type
  }
>;

// Represents the subset of report fields typically fetched with the interview list
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
  createdAt: Date; // Assuming createdAt is usually fetched with the report relation
  updatedAt: Date; // Assuming updatedAt is usually fetched with the report relation
  // Note: Fields like generalAssessment, areasOfStrength, transcript, etc., are likely not in this partial fetch
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
function aggregateProsodyData(transcript: string) {
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

export default function JobReportsPage(props: {
  params: Promise<{ jobId: string }>;
}) {
  const params = use(props.params);
  const router = useRouter();
  const [isOutOfMinutesDialogOpen, setIsOutOfMinutesDialogOpen] = useState(false);

  const {
    data: interviewsData,
    isLoading: interviewsLoading, // Renamed for clarity
    error: interviewsError, // Renamed for clarity
  } = useQuery<EntityList<InterviewWithReport>>({
    queryKey: ["job-interviews", params.jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${params.jobId}/interviews`);
      if (!response.ok) {
        throw new Error("Failed to fetch interviews");
      }
      return response.json();
    },
    refetchInterval: 3000,
  });

  const interviews = interviewsData?.data || [];

  const {
    data: jobData, // Renamed for clarity
    isLoading: jobIsLoading, // Renamed for clarity
    error: jobError, // Renamed for clarity
  } = useQuery({
    queryKey: ["job", params.jobId],
    queryFn: async () => {
      const jobRepo = await getRepository<Job>("jobs");
      return await jobRepo.getById(params.jobId);
    },
  });
  const job = jobData?.data; // Extracted job data

  const handleNewInterview = () => {
    router.push(`/dashboard/jobs/${params.jobId}/new-interview`);
  };

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

  const chartData = useMemo(() => {
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

  const prosodyChartData = useMemo(() => {
    if (!interviews.length) return { data: [], prosodies: [] };

    const allProsodyData = interviews.flatMap((interview) =>
      aggregateProsodyData(interview.data.transcript || "[]")
    );

    const prosodyTotals = allProsodyData.reduce(
      (acc, { name }) => {
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const topProsodies = Object.entries(prosodyTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name]) => name);

    const data = interviews
      .sort((a, b) => new Date(a.data.createdAt!).getTime() - new Date(b.data.createdAt!).getTime())
      .map((report) => {
        const prosodyData = aggregateProsodyData(report.data.transcript || "[]");

        const reducedProsodyData = topProsodies.reduce(
          (acc, prosodyName) => {
            acc[prosodyName] = prosodyData.find((p) => p.name === prosodyName)?.value || 0;
            return acc;
          },
          {} as Record<string, number>
        );

        return {
          date: new Date(report.data.createdAt).toLocaleDateString(),
          ...reducedProsodyData,
        };
      });

    return { data, prosodies: topProsodies };
  }, [interviews]);

  if (interviewsLoading || jobIsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <ParticleSwarmLoader />
      </div>
    );
  }

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
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header section */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto py-6 px-4">
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <Link
              href="/dashboard/jobs"
              className="flex items-center hover:text-foreground transition-colors"
            >
              <Briefcase className="h-3.5 w-3.5 mr-1.5" />
              Jobs
            </Link>
            <ChevronRight className="h-3.5 w-3.5 mx-2" />
            <span className="text-foreground font-medium">
              {job.role || "Job"} - Interview Reports
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight mb-1 text-foreground flex items-center flex-wrap gap-2">
                {job.role || "Selected Job"}
                <span className="text-muted-foreground font-medium text-base">
                  at {job.company || "Company"}
                </span>
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Job Created:
                  {job.createdAt &&
                    new Date(job.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  {interviews.length} {interviews.length === 1 ? "Report" : "Reports"} Generated
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <JobDetailsSheet jobId={params.jobId} />
              <Button
                onClick={handleNewInterview}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> New Interview
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics for this Job - New Section */}
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <div className="bg-card border border-border/20 p-6 rounded-xl shadow-md">
            <div className="flex items-center text-muted-foreground mb-2">
              <FileText className="w-5 h-5 mr-2 text-primary opacity-80" />
              <h3 className="text-md font-medium">Interviews Conducted (This Job)</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">{interviews.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Total interview reports generated for this specific job role.
            </p>
          </div>
          <div className="bg-card border border-border/20 p-6 rounded-xl shadow-md">
            <div className="flex items-center text-muted-foreground mb-2">
              <Clock className="w-5 h-5 mr-2 text-primary opacity-80" />
              <h3 className="text-md font-medium">Total Practice Time (This Job)</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {totalPracticeMinutesThisJob} <span className="text-lg font-normal">mins</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Combined duration of all practice interviews for this job.
            </p>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <ScrollArea className="flex-grow">
        <div className="container max-w-7xl mx-auto px-4 pb-8">
          {" "}
          {/* Added pb-8 for bottom padding */}
          {interviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No Reports Yet for This Job
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Practice an interview for the &quot;{job.role || "current"}
                &quot; role to generate your first report and see detailed feedback here.
              </p>
              <Button onClick={handleNewInterview} className="min-w-40">
                Start New Interview
              </Button>
            </div>
          ) : (
            <Tabs.Root defaultValue="reports" className="flex flex-col">
              <Tabs.List className="flex gap-1 border-b border-border">
                <Tabs.Trigger
                  value="reports"
                  className="group relative px-4 py-3 text-sm font-medium transition-colors hover:text-foreground data-[state=active]:text-primary -mb-px"
                >
                  <div className="flex items-center gap-2">
                    {" "}
                    <FileText className="w-4 h-4" /> Reports{" "}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transform origin-left scale-x-0 transition-transform group-data-[state=active]:scale-x-100" />
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="analytics"
                  className="group relative px-4 py-3 text-sm font-medium transition-colors hover:text-foreground data-[state=active]:text-primary -mb-px"
                >
                  <div className="flex items-center gap-2">
                    {" "}
                    <BarChart2 className="w-4 h-4" /> Analytics{" "}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transform origin-left scale-x-0 transition-transform group-data-[state=active]:scale-x-100" />
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="reports" className="outline-none pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {interviews
                    .sort(
                      (a, b) =>
                        new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime()
                    )
                    .map((interview) => (
                      <ReportCard
                        key={interview.sys.id}
                        report={interview.data.report as FullReportType | undefined} // Cast to FullReportType for ReportCard
                        jobId={params.jobId}
                      />
                    ))}
                </div>
              </Tabs.Content>

              <Tabs.Content value="analytics" className="outline-none pt-6">
                {/* New Analytics Content using PerformanceMetricsSection */}
                {latestInterviewScoresThisJob && averageScoresThisJob ? (
                  <PerformanceMetricsSection
                    primaryScores={latestInterviewScoresThisJob}
                    comparisonScores={averageScoresThisJob}
                    primaryScoresTitle="Latest Interview Performance (This Job)"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-card p-6 rounded-lg shadow">
                    <BarChart2 className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-1">Analytics Data Not Available</p>
                    <p className="text-sm text-center">
                      Complete at least one interview for this job to see performance analytics.
                    </p>
                  </div>
                )}
              </Tabs.Content>
            </Tabs.Root>
          )}
        </div>
      </ScrollArea>

      <OutOfMinutesModal
        isOpen={isOutOfMinutesDialogOpen}
        onClose={() => setIsOutOfMinutesDialogOpen(false)}
        onBuyMinutes={() => router.push("/pricing")}
      />
    </div>
  );
}
