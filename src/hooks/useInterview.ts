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
    // Dynamic staleTime: if job data is incomplete, mark as stale immediately
    // This forces refetch on every useInterview call until extraction completes
    staleTime: (query) => {
      const interview = query.state.data;

      // If no interview data yet, consider immediately stale
      if (!interview?.data?.job) return 0;

      // Check if candidate details and job description are extracted
      const isDataComplete =
        interview.data.job.candidateDetails && interview.data.job.jobDescription;

      // If incomplete: staleTime = 0 (refetch on every mount)
      // If complete: staleTime = 30s (normal caching)
      return isDataComplete ? 30000 : 0;
    },
  });
}
