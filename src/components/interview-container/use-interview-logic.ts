import useCustomisedSystemPrompt from "@/hooks/useCustomisedSystemPrompt";
import { ApiError } from "@/lib/errors";

import {
  useActiveInterview,
  useActiveInterviewActions,
  useActiveInterviewEnded,
} from "@/stores/useActiveInterviewStore";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MIN_INTERVIEW_DURATION_SECONDS } from "./constants";

interface UseInterviewLogicProps {
  jobId: string;
  interviewId: string;
}

export function useInterviewLogic({ jobId, interviewId }: UseInterviewLogicProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const interviewEnded = useActiveInterviewEnded();
  const { setActiveInterview, resetState, setShowTakeover, setTotalTime } =
    useActiveInterviewActions();
  const activeInterview = useActiveInterview();
  const hasGeneratedReportRef = useRef(false);
  const interviewDataLoaded = useRef(false);
  const [isInterviewTooShort, setIsInterviewTooShort] = useState(false);
  const [isGenerateReportErrorDialogOpen, setIsGenerateReportErrorDialogOpen] = useState(false);

  const { systemPrompt, interview, job, isLoading } = useCustomisedSystemPrompt({
    jobId,
    interviewId,
  });

  // Load interview data
  useEffect(() => {
    if (interview && !isLoading && !interviewDataLoaded.current) {
      setActiveInterview({
        id: interview.data.id,
        createdAt: interview.data.createdAt,
        updatedAt: interview.data.updatedAt,
        actualTime: interview.data.actualTime,
        duration: interview.data.duration,
        type: interview.data.type,
        keyQuestions: interview.data.keyQuestions,
        jobId,
        customSessionId: interview.data.customSessionId,
        transcript: interview.data.transcript,
        chatGroupId: interview.data.chatGroupId,
        humeChatId: interview.data.humeChatId,
        requestId: interview.data.requestId,
      });
      interviewDataLoaded.current = true;
    }
  }, [interview, setActiveInterview, isLoading, jobId]);

  // Audio reconstruction mutation
  const { mutate: requestAudioReconstruction } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/interviews/${interviewId}/audio-reconstruction`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new ApiError("Failed to initiate audio reconstruction", response.status);
      }

      return response.json();
    },
    onSuccess: () => {
      setShowTakeover(false);
      resetState();
      router.push(`/dashboard/jobs/${jobId}/interviews`);
    },
    onError: (error) => {
      Sentry.withScope((scope) => {
        scope.setContext("params", { jobId, interviewId });
        scope.setExtra("message", error instanceof Error ? error.message : "Unknown error");
        Sentry.captureException(error);
      });
      resetState();
    },
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const body = {
        jobId,
        interviewId,
      };

      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new ApiError("Failed to generate report", response.status);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["job", jobId],
      });
      queryClient.invalidateQueries({
        queryKey: ["interview", interviewId],
      });
      requestAudioReconstruction();
      resetState();
    },
    onError: (error) => {
      toast.error("Failed to generate report. Please try again.");
      setShowTakeover(false);
      setIsGenerateReportErrorDialogOpen(true);

      Sentry.withScope((scope) => {
        scope.setContext("params", { jobId, interviewId });
        scope.setExtra("message", error instanceof Error ? error.message : "Unknown error");
        Sentry.captureException(error);
      });
      resetState();
    },
  });

  // Handle interview end
  useEffect(() => {
    if (interviewEnded && !hasGeneratedReportRef.current) {
      setShowTakeover(true);
      const actualTimeInSeconds =
        (activeInterview?.actualTime || interview?.data.actualTime || 0) * 60;

      if (actualTimeInSeconds < MIN_INTERVIEW_DURATION_SECONDS) {
        setIsInterviewTooShort(true);
      } else {
        generateReportMutation.mutate();
        hasGeneratedReportRef.current = true;
      }
    }
  }, [interviewEnded, generateReportMutation, setShowTakeover, activeInterview, interview]);

  // Set total time
  useEffect(() => {
    if (interview?.data.duration) {
      const totalTime = interview.data.actualTime
        ? interview.data.duration - interview.data.actualTime
        : interview.data.duration;

      setTotalTime(totalTime * 60);
    }
  }, [interview, setTotalTime]);

  const handleRetryGenerateReport = useCallback(() => {
    setIsGenerateReportErrorDialogOpen(false);
    setShowTakeover(true);
    generateReportMutation.mutate();
  }, [generateReportMutation, setShowTakeover]);

  const handleCancelGenerateReport = useCallback(() => {
    setIsGenerateReportErrorDialogOpen(false);
    router.push(`/dashboard/jobs/${jobId}/interviews`);
  }, [router, jobId]);

  return {
    systemPrompt,
    interview,
    job, // Export job for userId access
    isLoading,
    isInterviewTooShort,
    isGenerateReportErrorDialogOpen,
    setIsGenerateReportErrorDialogOpen,
    handleRetryGenerateReport,
    handleCancelGenerateReport,
  };
}
