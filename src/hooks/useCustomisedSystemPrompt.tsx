"use client";

import { getRepository } from "@/lib/data/repositoryFactory";
import { createInterviewInstructions } from "@/utils/conversation_config";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { InferResultType } from "~/db/helpers";
import type { CandidateDetails, JobDescription } from "~/db/schema";
import { useJob } from "./useJob";

type InterviewWithJobDescriptionAndCandidateDetails = InferResultType<"interviews"> & {
  job: {
    jobDescription: JobDescription;
    candidateDetails: CandidateDetails;
  };
};

export default function useCustomisedSystemPrompt({
  jobId,
  interviewId,
}: {
  jobId: string;
  interviewId: string;
}) {
  const { data: job, isLoading: jobIsLoading } = useJob(jobId);

  const { data: interview, isLoading: interviewIsLoading } = useQuery({
    queryKey: ["interview", interviewId],
    queryFn: async () => {
      const interviewRepo =
        await getRepository<InterviewWithJobDescriptionAndCandidateDetails>("interviews");
      return await interviewRepo.getById(interviewId);
    },
    enabled: !!interviewId,
  });

  const systemPrompt = useMemo(() => {
    if (!job) return "";
    if (!interview) return "";

    return createInterviewInstructions({
      cvText: job.data.submittedCVText,
      structuredCandidateDetails: job.data.candidateDetails,
      structuredJobDescription: job.data.jobDescription,
      duration: interview.data.duration,
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
