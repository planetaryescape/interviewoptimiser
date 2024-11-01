"use client";

import { ConfirmationModal } from "@/components/create-optimization/ConfirmationModal";
import { OutOfMinutesModal } from "@/components/create-optimization/OutOfMinutesModal";
import { ReportCard } from "@/components/report-card";
import { Button } from "@/components/ui/button";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { Interview, Report } from "@/db/schema";
import { useUser } from "@/hooks/useUser";
import { getRepository } from "@/lib/data/repositoryFactory";
import { EntityList } from "@/lib/utils/formatEntity";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { use, useState } from "react";

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
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Interviews
            </Link>
          </Button>
        </div>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Interview Reports</h1>
          <Button onClick={handleRetakeInterview}>
            <RefreshCw className="w-4 h-4 mr-2" />
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
