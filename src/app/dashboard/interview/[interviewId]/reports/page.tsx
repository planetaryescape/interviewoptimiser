"use client";

import { ReportCard } from "@/components/report-card";
import { Button } from "@/components/ui/button";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { Report } from "@/db/schema";
import { EntityList } from "@/lib/utils/formatEntity";
import { useQuery } from "@tanstack/react-query";
import { FileText, RefreshCw } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function InterviewReportsPage(props: {
  params: Promise<{ interviewId: string }>;
}) {
  const params = use(props.params);

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
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ParticleSwarmLoader />
      </div>
    );
  }

  if (error) {
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
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Interview Reports</h1>
        <Button asChild>
          <Link
            href={`/dashboard/interview/${params.interviewId}`}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retake Interview
          </Link>
        </Button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Reports Yet</h2>
          <p className="text-gray-600 mb-6">
            Take the interview to generate your first report.
          </p>
          <Button asChild>
            <Link href={`/dashboard/interview/${params.interviewId}`}>
              Start Interview
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => (
            <ReportCard
              key={report.sys.id}
              report={report}
              interviewId={params.interviewId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
