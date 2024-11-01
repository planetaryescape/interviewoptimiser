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
import { EntityList } from "@/lib/utils/formatEntity";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart2,
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
};

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
      .map((report) => {
        console.log("Individual report data:", report.data);

        // Access the scores directly from report.data
        return {
          date: new Date(report.data.createdAt).toLocaleDateString(),
          technicalScore: Math.round(report.data.technicalKnowledgeScore || 0),
          communicationScore: Math.round(
            report.data.communicationSkillsScore || 0
          ),
          problemSolvingScore: Math.round(
            report.data.problemSolvingSkillsScore || 0
          ),
        };
      });

    return prepared;
  }, [reportsData]);

  // Add this console log before the render
  console.log("Final chart data being used:", chartData);

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
        <div className="flex-none mb-8">
          <div className="flex items-center text-sm text-muted-foreground">
            <Link
              href="/dashboard"
              className="flex items-center hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-foreground">Interview Reports</span>
          </div>

          <div className="mt-6 bg-card rounded-lg p-6 border shadow-sm">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">
                    {interview?.data.role || "Interview"} Position
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    at {interview?.data.company || "Company"}
                  </p>
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Candidate</p>
                    <p className="font-medium">
                      {interview?.data.candidate || "Anonymous Candidate"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Interview Type
                    </p>
                    <p className="font-medium capitalize">
                      {interview?.data.type || "Technical"}
                    </p>
                  </div>
                  {interview?.data.createdAt && (
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {new Date(interview.data.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCharts(!showCharts)}
                  className="gap-2"
                >
                  <BarChart2 className="w-4 h-4" />
                  {showCharts ? "Hide Charts" : "Show Charts"}
                </Button>
                <Button onClick={handleRetakeInterview}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retake Interview
                </Button>
              </div>
            </div>
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
          <div className="flex-1 flex flex-col min-h-0">
            {/* Charts section */}
            {showCharts && (
              <div className="flex-none mb-6">
                <div className="bg-card rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">
                    Progress Overview
                  </h2>
                  {chartData.length === 0 ? (
                    <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
                      No chart data available
                    </div>
                  ) : (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
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
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Info section */}
            <div className="flex-none mb-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {reports.length}
                  </span>{" "}
                  {reports.length === 1 ? "report" : "reports"} available
                </div>
                {reports.length > 4 && (
                  <div className="text-sm text-muted-foreground">
                    Scroll to see more reports ↓
                  </div>
                )}
              </div>
            </div>

            {/* Reports grid in scroll area */}
            <div className="flex-1 min-h-0 relative">
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
            </div>
          </div>
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
