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
    // Dynamic staleTime: prevents long-term caching of incomplete data
    staleTime: (query) => {
      const interview = query.state.data;
      if (!interview?.data?.job) return 0;

      const isDataComplete =
        interview.data.job.candidateDetails && interview.data.job.jobDescription;
      return isDataComplete ? 30000 : 0;
    },
    // Polling: actively checks for extraction completion while component is mounted
    // Combined with staleTime, this ensures we detect when server-side extraction finishes
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
