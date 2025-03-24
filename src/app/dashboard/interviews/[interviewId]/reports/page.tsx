"use client";

import { ConfirmationModal } from "@/components/create-optimization/ConfirmationModal";
import { OutOfMinutesModal } from "@/components/create-optimization/OutOfMinutesModal";
import { ReportCard } from "@/components/report-card";
import { Button } from "@/components/ui/button";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/hooks/useUser";
import { getRepository } from "@/lib/data/repositoryFactory";
import type { Entity, EntityList } from "@/lib/utils/formatEntity";
import * as Tabs from "@radix-ui/react-tabs";
import { useQuery } from "@tanstack/react-query";
import { BarChart2, Calendar, ChevronRight, FileText, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
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
import type { Interview, Report } from "~/db/schema";

// Add this type for the chart data
type ChartDataPoint = {
  date: string;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  teamworkScore: number;
};

// Add these types
type ProsodyDataPoint = {
  date: string;
  [key: string]: string | number; // For dynamic prosody values
};

// Add this function before the component
const getTopProsodies = (reports: Entity<Report>[]) => {
  // Count total occurrences of each prosody across all reports
  const prosodyCount = new Map<string, number>();

  for (const report of reports) {
    const prosodies = report.data.transcript ? JSON.parse(report.data.transcript) : [];
    for (const prosody of Object.keys(prosodies)) {
      prosodyCount.set(prosody, (prosodyCount.get(prosody) || 0) + 1);
    }
  }

  // Sort and get top prosodies
  return Array.from(prosodyCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([prosody]) => prosody);
};

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

export default function InterviewReportsPage(props: {
  params: Promise<{ interviewId: string }>;
}) {
  const params = use(props.params);
  const router = useRouter();
  const posthog = usePostHog();
  const { data: user } = useUser();
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isOutOfMinutesDialogOpen, setIsOutOfMinutesDialogOpen] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

  const {
    data: reportsData,
    isLoading,
    error,
  } = useQuery<EntityList<Report>>({
    queryKey: ["interview-reports", params.interviewId],
    queryFn: async () => {
      const response = await fetch(`/api/interviews/${params.interviewId}/reports`);
      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }
      return response.json();
    },
    refetchInterval: 3000,
  });

  const {
    data: interview,
    isLoading: interviewIsLoading,
    error: interviewError,
  } = useQuery({
    queryKey: ["interview", params.interviewId],
    queryFn: async () => {
      const interviewRepo = await getRepository<Interview>("interviews");
      return await interviewRepo.getById(params.interviewId);
    },
  });

  const handleRetakeInterview = () => {
    if (!user || user.minutes <= (interview?.data.duration || 3)) {
      // Assuming 3 minutes for the shortest interview
      posthog.capture("out_of_minutes", {
        userId: user?.id,
      });
      setIsOutOfMinutesDialogOpen(true);
    } else {
      setIsAlertDialogOpen(true);
    }
  };

  const handleConfirmRetake = () => {
    setIsAlertDialogOpen(false);
    router.push(`/dashboard/interviews/${params.interviewId}`);
  };

  // Add this function to prepare chart data
  const chartData = useMemo(() => {
    if (!reportsData?.data.length) return [];

    const prepared = reportsData.data
      .sort((a, b) => new Date(a.data.createdAt!).getTime() - new Date(b.data.createdAt!).getTime())
      .map((report) => ({
        date: new Date(report.data.createdAt).toLocaleDateString(),
        technicalScore: Math.round(report.data.technicalKnowledgeScore || 0),
        communicationScore: Math.round(report.data.communicationSkillsScore || 0),
        problemSolvingScore: Math.round(report.data.problemSolvingSkillsScore || 0),
        teamworkScore: Math.round(report.data.teamworkScore || 0),
      }));

    return prepared;
  }, [reportsData]);

  // Update the prosodyChartData useMemo
  const prosodyChartData = useMemo(() => {
    if (!reportsData?.data.length) return { data: [], prosodies: [] };

    // First, get all prosody data from all reports to determine top prosodies
    const allProsodyData = reportsData.data.flatMap((report) =>
      aggregateProsodyData(report.data.transcript || "[]")
    );

    // Count total occurrences of each prosody across all reports
    const prosodyTotals = allProsodyData.reduce(
      (acc, { name }) => {
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get top 6 most frequent prosodies
    const topProsodies = Object.entries(prosodyTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name]) => name);

    // Prepare the data points for each report
    const data = reportsData.data
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
  }, [reportsData]);

  if (isLoading || interviewIsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <ParticleSwarmLoader className="h-16 w-16" />
      </div>
    );
  }

  if (error || interviewError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] px-4">
        <FileText className="w-16 h-16 text-gray-300 mb-6" />
        <h1 className="text-2xl font-semibold mb-2">Error Loading Reports</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
          There was an error loading the interview reports. Please try again later.
        </p>
        <Button asChild variant="outline" className="min-w-40">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  const reports = reportsData?.data || [];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header section */}
      <div className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto py-6 px-4">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
            <Link
              href="/dashboard"
              className="flex items-center hover:text-foreground transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="sr-only">Dashboard</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 mx-2" />
            <span className="text-gray-900 dark:text-gray-100 font-medium">Interview Reports</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight mb-1 text-gray-900 dark:text-white flex items-center flex-wrap gap-2">
                {interview?.data.role || "Interview"}
                <span className="text-gray-500 dark:text-gray-400 font-medium text-base">
                  at {interview?.data.company || "Company"}
                </span>
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {interview?.data.createdAt &&
                    new Date(interview.data.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  {reports.length} {reports.length === 1 ? "report" : "reports"}
                </div>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 capitalize">
                  {interview?.data.type || "Technical"} Interview
                </div>
              </div>
            </div>

            <Button
              onClick={handleRetakeInterview}
              className="gap-2 sm:self-start"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4" />
              Retake Interview
            </Button>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="flex-1 overflow-hidden">
        {reports.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="max-w-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Reports Yet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Take the interview to generate your first report and receive detailed feedback.
              </p>
              <Button onClick={handleRetakeInterview} className="min-w-40">
                Start Interview
              </Button>
            </div>
          </div>
        ) : (
          <Tabs.Root defaultValue="reports" className="h-full flex flex-col">
            <div className="container max-w-7xl mx-auto px-4">
              <Tabs.List className="flex gap-1 mt-6 border-b border-gray-200 dark:border-gray-800">
                <Tabs.Trigger
                  value="reports"
                  className="group relative px-4 py-2 text-sm font-medium transition-colors hover:text-gray-900 dark:hover:text-gray-100 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white -mb-px"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Reports
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transform origin-left scale-x-0 transition-transform group-data-[state=active]:scale-x-100" />
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="analytics"
                  className="group relative px-4 py-2 text-sm font-medium transition-colors hover:text-gray-900 dark:hover:text-gray-100 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white -mb-px"
                >
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4" />
                    Analytics
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transform origin-left scale-x-0 transition-transform group-data-[state=active]:scale-x-100" />
                </Tabs.Trigger>
              </Tabs.List>
            </div>

            <Tabs.Content value="reports" className="flex-1 overflow-hidden outline-none">
              <div className="h-full">
                <ScrollArea className="h-full">
                  <div className="container max-w-7xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {reports
                        .sort(
                          (a, b) =>
                            new Date(b.data.createdAt).getTime() -
                            new Date(a.data.createdAt).getTime()
                        )
                        .map((report) => (
                          <ReportCard
                            key={report.sys.id}
                            report={report}
                            interviewId={params.interviewId}
                          />
                        ))}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </Tabs.Content>

            <Tabs.Content value="analytics" className="flex-1 overflow-auto outline-none">
              <div className="container max-w-7xl mx-auto px-4 py-6">
                <div className="space-y-8">
                  {/* Skills Progress Chart */}
                  <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                      <h2 className="text-lg font-semibold tracking-tight">Skills Progress</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Track your improvement over time across different interview skills.
                      </p>
                    </div>
                    <div className="p-6">
                      {chartData.length === 0 ? (
                        <div className="h-[300px] w-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                          No chart data available yet. Complete more interviews to see progress.
                        </div>
                      ) : (
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                              data={chartData}
                              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis
                                dataKey="date"
                                stroke="#9ca3af"
                                fontSize={12}
                                tickLine={false}
                              />
                              <YAxis
                                domain={[0, 100]}
                                stroke="#9ca3af"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}%`}
                              />
                              <Tooltip
                                formatter={(value: number) => [`${value}%`]}
                                contentStyle={{
                                  backgroundColor: "white",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "0.375rem",
                                  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                                }}
                                labelStyle={{
                                  fontWeight: 600,
                                  marginBottom: "0.5rem",
                                  color: "#111827",
                                }}
                              />
                              <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                iconSize={8}
                              />
                              <Line
                                type="monotone"
                                dataKey="technicalScore"
                                name="Technical Knowledge"
                                stroke="#2563eb"
                                strokeWidth={2}
                                dot={{ r: 4, strokeWidth: 0, fill: "#2563eb" }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="communicationScore"
                                name="Communication Skills"
                                stroke="#16a34a"
                                strokeWidth={2}
                                dot={{ r: 4, strokeWidth: 0, fill: "#16a34a" }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="problemSolvingScore"
                                name="Problem Solving"
                                stroke="#dc2626"
                                strokeWidth={2}
                                dot={{ r: 4, strokeWidth: 0, fill: "#dc2626" }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="teamworkScore"
                                name="Teamwork"
                                stroke="#9333ea"
                                strokeWidth={2}
                                dot={{ r: 4, strokeWidth: 0, fill: "#9333ea" }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Prosody Trends Chart */}
                  <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                      <h2 className="text-lg font-semibold tracking-tight">Prosody Trends</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Analyze patterns in your communication style and prosody across interviews.
                      </p>
                    </div>
                    <div className="p-6">
                      {prosodyChartData.data.length === 0 ? (
                        <div className="h-[300px] w-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                          No prosody data available yet. Complete more interviews to see trends.
                        </div>
                      ) : (
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                              data={prosodyChartData.data}
                              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis
                                dataKey="date"
                                stroke="#9ca3af"
                                fontSize={12}
                                tickLine={false}
                              />
                              <YAxis
                                domain={[0, 100]}
                                stroke="#9ca3af"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}%`}
                              />
                              <Tooltip
                                formatter={(value: number) => [`${value}%`]}
                                contentStyle={{
                                  backgroundColor: "white",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "0.375rem",
                                  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                                }}
                                labelStyle={{
                                  fontWeight: 600,
                                  marginBottom: "0.5rem",
                                  color: "#111827",
                                }}
                              />
                              <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                iconSize={8}
                              />
                              {prosodyChartData.prosodies.map((prosody, index) => {
                                // Generate a different color for each prosody
                                const colors = [
                                  "#8b5cf6", // violet
                                  "#ec4899", // pink
                                  "#f97316", // orange
                                  "#06b6d4", // cyan
                                  "#84cc16", // lime
                                  "#f43f5e", // rose
                                  "#6366f1", // indigo
                                  "#14b8a6", // teal
                                ];

                                return (
                                  <Line
                                    key={prosody}
                                    type="monotone"
                                    dataKey={prosody}
                                    name={prosody.charAt(0).toUpperCase() + prosody.slice(1)}
                                    stroke={colors[index % colors.length]}
                                    strokeWidth={2}
                                    dot={{
                                      r: 4,
                                      strokeWidth: 0,
                                      fill: colors[index % colors.length],
                                    }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                  />
                                );
                              })}
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        )}
      </div>

      <ConfirmationModal
        isOpen={isAlertDialogOpen}
        onClose={() => setIsAlertDialogOpen(false)}
        onConfirm={handleConfirmRetake}
        userMinutes={user?.minutes || 0}
        interview={interview?.data}
      />

      <OutOfMinutesModal
        isOpen={isOutOfMinutesDialogOpen}
        onClose={() => setIsOutOfMinutesDialogOpen(false)}
        onBuyMinutes={() => router.push("/pricing")}
      />
    </div>
  );
}
