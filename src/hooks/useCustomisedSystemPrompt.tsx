"use client";

import { createInterviewInstructions } from "@/utils/conversation_config";
import { useMemo } from "react";
import { useJob } from "./useJob";

export default function useCustomisedSystemPrompt({
  jobId,
}: {
  jobId: string;
}) {
  const { data: job, isLoading } = useJob(jobId);

  const systemPrompt = useMemo(() => {
    if (!job) return "";

    return createInterviewInstructions({
      cvText: job.data.submittedCVText,
      structuredCandidateDetails: job.data.candidateDetails,
      structuredJobDescription: job.data.jobDescription,
      duration: job.data.duration,
      interviewType: job.data.type,
    });
  }, [job]);

  return { systemPrompt, job, isLoading };
}
