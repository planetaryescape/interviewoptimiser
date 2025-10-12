"use client";

import { createInterviewInstructions } from "@/utils/conversation_config";
import { useMemo } from "react";
import { useInterview } from "./useInterview";
import { useJob } from "./useJob";

export default function useCustomisedSystemPrompt({
  jobId,
  interviewId,
}: {
  jobId: string;
  interviewId: string;
}) {
  const { data: job, isLoading: jobIsLoading } = useJob(jobId);
  const { data: interview, isLoading: interviewIsLoading } = useInterview(interviewId);

  const systemPrompt = useMemo(() => {
    if (!job) return "";
    if (!interview) return "";

    return createInterviewInstructions({
      cvText: job.data.submittedCVText,
      structuredCandidateDetails: job.data.candidateDetails,
      structuredJobDescription: job.data.jobDescription,
      duration: interview.data.actualTime
        ? interview.data.duration - interview.data.actualTime
        : interview.data.duration,
      interviewType: interview.data.type,
      keyQuestions: interview.data.keyQuestions ?? [],
    });
  }, [job, interview]);

  return {
    systemPrompt,
    job,
    interview,
    isLoading: jobIsLoading || interviewIsLoading,
  };
}
