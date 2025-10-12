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
    // Dynamic staleTime: marks incomplete data as immediately stale
    // Stale data refetches on mount/remount, but NOT while component stays mounted
    // That's why refetchInterval is also needed (see below)
    staleTime: (query) => {
      const job = query.state.data;
      if (!job?.data) return 0;

      const isDataComplete = job.data.candidateDetails && job.data.jobDescription;
      return isDataComplete ? 30000 : 0;
    },
    // Polling: actively checks for extraction completion WHILE component is mounted
    // Without this, button stays disabled until user manually reloads or refocuses window
    // staleTime alone only triggers refetch on mount/remount events
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
