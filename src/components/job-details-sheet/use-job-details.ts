import { useQuery } from "@tanstack/react-query";
import type { Entity } from "@/lib/utils/formatEntity";
import type { JobDescription } from "~/db/schema";

export function useJobDetails(jobId: string, isOpen: boolean) {
  return useQuery<Entity<JobDescription>>({
    queryKey: ["jobDescription", jobId],
    queryFn: async () => {
      const res = await fetch(`/api/job-descriptions/${jobId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch job description");
      }
      return res.json();
    },
    enabled: isOpen,
  });
}
