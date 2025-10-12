import { getRepository } from "@/lib/data/repositoryFactory";
import { useQuery } from "@tanstack/react-query";
import type { InferResultType } from "~/db/helpers";

type JobWithJobDescriptionAndCandidateDetails = InferResultType<
  "jobs",
  {
    candidateDetails: true;
    jobDescription: true;
  }
>;

export function useJob(jobId: string) {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const jobsRepo = await getRepository<JobWithJobDescriptionAndCandidateDetails>("jobs");
      const job = await jobsRepo.getById(jobId);
      return job;
    },
    // Dynamic staleTime: if data is incomplete, mark as stale immediately
    // This forces refetch on every useJob call until extraction completes
    staleTime: (query) => {
      const job = query.state.data;

      // If no data yet, consider immediately stale
      if (!job?.data) return 0;

      // Check if candidate details and job description are extracted
      const isDataComplete = job.data.candidateDetails && job.data.jobDescription;

      // If incomplete: staleTime = 0 (refetch on every mount)
      // If complete: staleTime = 30s (normal caching)
      return isDataComplete ? 30000 : 0;
    },
  });
}
