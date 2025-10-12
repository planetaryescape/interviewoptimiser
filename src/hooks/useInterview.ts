import { getRepository } from "@/lib/data/repositoryFactory";
import { useQuery } from "@tanstack/react-query";
import type { InferResultType } from "~/db/helpers";
import type { CandidateDetails, JobDescription } from "~/db/schema";

type InterviewWithJobDescriptionAndCandidateDetails = InferResultType<"interviews"> & {
  job: {
    jobDescription: JobDescription | null;
    candidateDetails: CandidateDetails | null;
  };
};

export function useInterview(interviewId: string) {
  return useQuery({
    queryKey: ["interview", interviewId],
    queryFn: async () => {
      const interviewRepo =
        await getRepository<InterviewWithJobDescriptionAndCandidateDetails>("interviews");
      return await interviewRepo.getById(interviewId);
    },
    enabled: !!interviewId,
    // Dynamic staleTime: marks incomplete data as immediately stale
    // Stale data refetches on mount/remount, but NOT while component stays mounted
    // That's why refetchInterval is also needed (see below)
    staleTime: (query) => {
      const interview = query.state.data;
      if (!interview?.data?.job) return 0;

      const isDataComplete =
        interview.data.job.candidateDetails && interview.data.job.jobDescription;
      return isDataComplete ? 30000 : 0;
    },
    // Polling: actively checks for extraction completion WHILE component is mounted
    // Without this, button stays disabled until user manually reloads or refocuses window
    // staleTime alone only triggers refetch on mount/remount events
    refetchInterval: (query) => {
      const interview = query.state.data;

      // No data yet, keep checking
      if (!interview?.data?.job) return 3000;

      // Check if extraction is complete
      const isDataComplete =
        interview.data.job.candidateDetails && interview.data.job.jobDescription;

      // If complete, stop polling. If incomplete, check every 3s
      return isDataComplete ? false : 3000;
    },
  });
}
