import { useQuery } from "@tanstack/react-query";
import type { InferResultType } from "~/db/helpers";

type Job = InferResultType<
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
      const response = await fetch(`/api/jobs/${jobId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch job details");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data.data as Job;
    },
  });
}
