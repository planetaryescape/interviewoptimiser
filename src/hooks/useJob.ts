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
    staleTime: 30000, // Cache valid for 30s, allows instant load from cache while background refetch happens
  });
}
