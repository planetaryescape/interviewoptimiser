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
    // Dynamic staleTime: prevents long-term caching of incomplete data
    staleTime: (query) => {
      const job = query.state.data;
      if (!job?.data) return 0;

      const isDataComplete = job.data.candidateDetails && job.data.jobDescription;
      return isDataComplete ? 30000 : 0;
    },
    // Polling: actively checks for extraction completion while component is mounted
    // Combined with staleTime, this ensures we detect when server-side extraction finishes
    refetchInterval: (query) => {
      const job = query.state.data;

      // No data yet, keep checking
      if (!job?.data) return 3000;

      // Check if extraction is complete
      const isDataComplete = job.data.candidateDetails && job.data.jobDescription;

      // If complete, stop polling. If incomplete, check every 3s
      return isDataComplete ? false : 3000;
    },
  });
}
