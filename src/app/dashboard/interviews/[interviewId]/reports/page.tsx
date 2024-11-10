"use client";

import { ConfirmationModal } from "@/components/create-optimization/ConfirmationModal";
import { OutOfMinutesModal } from "@/components/create-optimization/OutOfMinutesModal";
import { ReportCard } from "@/components/report-card";
import { Button } from "@/components/ui/button";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Interview, Report } from "@/db/schema";
import { useUser } from "@/hooks/useUser";
import { getRepository } from "@/lib/data/repositoryFactory";
import { Entity, EntityList } from "@/lib/utils/formatEntity";
import * as Tabs from "@radix-ui/react-tabs";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart2,
  Calendar,
  ChevronRight,
  FileText,
  Home,
  RefreshCw,
} from "lucide-react";
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

  reports.forEach((report) => {
    const prosodies = report.data.transcript
      ? JSON.parse(report.data.transcript)
      : [];
    Object.keys(prosodies).forEach((prosody) => {
      prosodyCount.set(prosody, (prosodyCount.get(prosody) || 0) + 1);
    });
  });

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

  messages.forEach(
    (message: { role: string; prosody: Record<string, number> }) => {
      if (message.role === "user" && message.prosody) {
        totalMessages++;
        Object.entries(message.prosody).forEach(([key, value]) => {
          prosodyTotals[key] = (prosodyTotals[key] || 0) + value;
        });
      }
    }
  );

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
  const [isOutOfMinutesDialogOpen, setIsOutOfMinutesDialogOpen] =
    useState(false);
  const [showCharts, setShowCharts] = useState(false);

  const {
    data: reportsData,
    isLoading,
    error,
  } = useQuery<EntityList<Report>>({
    queryKey: ["interview-reports", params.interviewId],
    queryFn: async () => {
      const response = await fetch(
        `/api/interviews/${params.interviewId}/reports`
      );
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
    if (!user || user.minutes <= 0 || user.minutes < 30) {
      // Assuming 30 minutes for an interview
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
    router.push(`/dashboard/interview/${params.interviewId}`);
  };

  // Add this function to prepare chart data
  const chartData = useMemo(() => {
    console.log("Raw reports data:", reportsData?.data);

    if (!reportsData?.data.length) return [];

    const prepared = reportsData.data
      .sort(
        (a, b) =>
          new Date(a.data.createdAt!).getTime() -
          new Date(b.data.createdAt!).getTime()
      )
      .map((report) => ({
        date: new Date(report.data.createdAt).toLocaleDateString(),
        technicalScore: Math.round(report.data.technicalKnowledgeScore || 0),
        communicationScore: Math.round(
          report.data.communicationSkillsScore || 0
        ),
        problemSolvingScore: Math.round(
          report.data.problemSolvingSkillsScore || 0
        ),
        teamworkScore: Math.round(report.data.teamworkScore || 0),
      }));

    return prepared;
  }, [reportsData]);

  // Add this console log before the render
  console.log("Final chart data being used:", chartData);

  // Update the prosodyChartData useMemo
  const prosodyChartData = useMemo(() => {
    console.log("Calculating prosody chart data...");
    if (!reportsData?.data.length) return { data: [], prosodies: [] };

    // First, get all prosody data from all reports to determine top prosodies
    const allProsodyData = reportsData.data.flatMap(report =>
      aggregateProsodyData(report.data.transcript || "[]")
    );

    // Count total occurrences of each prosody across all reports
    const prosodyTotals = allProsodyData.reduce((acc, { name }) => {
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get top 6 most frequent prosodies
    const topProsodies = Object.entries(prosodyTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name]) => name);

    console.log("Top prosodies found:", topProsodies);

    // Prepare the data points for each report
    const data = reportsData.data
      .sort((a, b) =>
        new Date(a.data.createdAt!).getTime() - new Date(b.data.createdAt!).getTime()
      )
      .map(report => {
        const prosodyData = aggregateProsodyData(report.data.transcript || "[]");
        console.log("Prosody data for report:", prosodyData);

        return {
          date: new Date(report.data.createdAt).toLocaleDateString(),
          ...topProsodies.reduce((acc, prosodyName) => ({
            ...acc,
            [prosodyName]: prosodyData.find(p => p.name === prosodyName)?.value || 0,
          }), {})
        };
      });

    console.log("Final prosody chart data:", { data, prosodies: topProsodies });
    return { data, prosodies: topProsodies };
  }, [reportsData]);

  if (isLoading || interviewIsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ParticleSwarmLoader />
      </div>
    );
  }

  if (error || interviewError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Error Loading Reports</h1>
        <p className="text-gray-600 mb-8">
          There was an error loading the interview reports.
        </p>
        <Button asChild>
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const reports = reportsData?.data || [];

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 h-[calc(100vh-theme(spacing.16))]">
      <div className="flex flex-col h-full gap-6">
        <div className="flex-none">
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <Link
              href="/dashboard"
              className="flex items-center hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-foreground">Interview Reports</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                  {interview?.data.role || "Interview"}
                  <span className="text-muted-foreground font-normal text-base">
                    at {interview?.data.company || "Company"}
                  </span>
                </h1>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {interview?.data.createdAt &&
                      new Date(interview.data.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {reports.length}{" "}
                    {reports.length === 1 ? "report" : "reports"}
                  </div>
                  <div className="capitalize">
                    {interview?.data.type || "Technical"} Interview
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={handleRetakeInterview} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Retake Interview
            </Button>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Reports Yet</h2>
            <p className="text-gray-600 mb-6">
              Take the interview to generate your first report.
            </p>
            <Button onClick={handleRetakeInterview}>Start Interview</Button>
          </div>
        ) : (
          <Tabs.Root
            defaultValue="reports"
            className="flex-1 flex flex-col min-h-0"
          >
            <Tabs.List className="flex gap-1 pb-6">
              <Tabs.Trigger
                value="reports"
                className="group inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Reports
              </Tabs.Trigger>
              <Tabs.Trigger
                value="analytics"
                className="group inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <BarChart2 className="w-4 h-4 mr-2" />
                Analytics
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content
              value="reports"
              className="flex-1 min-h-0 relative outline-none"
            >
              <ScrollArea className="h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-4">
                  {reports.map((report) => (
                    <ReportCard
                      key={report.sys.id}
                      report={report}
                      interviewId={params.interviewId}
                    />
                  ))}
                </div>
              </ScrollArea>
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
            </Tabs.Content>

            <Tabs.Content
              value="analytics"
              className="flex-1 min-h-0 relative outline-none overflow-auto"
            >
              <div className="bg-card rounded-lg p-6 shadow-sm space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Skills Progress
                  </h2>
                  {chartData.length === 0 ? (
                    <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
                      No chart data available
                    </div>
                  ) : (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={chartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip
                            formatter={(value: number) => [`${value}%`]}
                            labelStyle={{ color: "black" }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="technicalScore"
                            name="Technical Knowledge"
                            stroke="#2563eb"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="communicationScore"
                            name="Communication Skills"
                            stroke="#16a34a"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="problemSolvingScore"
                            name="Problem Solving"
                            stroke="#dc2626"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="teamworkScore"
                            name="Teamwork"
                            stroke="#9333ea"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Prosody Trends</h2>
                  {prosodyChartData.data.length === 0 ? (
                    <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
                      No prosody data available
                    </div>
                  ) : (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={prosodyChartData.data}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip
                            formatter={(value: number) => [`${value}%`]}
                            labelStyle={{ color: "black" }}
                          />
                          <Legend />
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
                                name={
                                  prosody.charAt(0).toUpperCase() +
                                  prosody.slice(1)
                                }
                                stroke={colors[index % colors.length]}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                              />
                            );
                          })}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
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
