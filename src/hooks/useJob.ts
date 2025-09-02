import { useQuery } from "@tanstack/react-query";
import { getRepository } from "@/lib/data/repositoryFactory";
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
  });
}
