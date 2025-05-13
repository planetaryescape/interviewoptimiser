import { BackgroundGradient as AnotherBackgroundGradient } from "@/components/background-gradient";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { InferResultType } from "~/db/helpers";
import { JobCard } from "./interview-card";

type JobWithCandidateDetailsAndJobDescriptionAndInterviews = InferResultType<
  "jobs",
  {
    candidateDetails: true;
    jobDescription: true;
    interviews: true;
  }
>;

interface JobsGridProps {
  jobs: Array<JobWithCandidateDetailsAndJobDescriptionAndInterviews>;
  onDelete?: (id: number) => void;
  deletingId: number | null;
}

export const JobsGrid = ({ jobs, onDelete, deletingId }: JobsGridProps) => {
  return (
    <ScrollArea className="relative size-full row-span-1 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 text-card-foreground p-4">
      <div className="size-full grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 auto-rows-max">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onDelete={onDelete} deletingId={deletingId} />
        ))}
      </div>

      <AnotherBackgroundGradient degrees={Math.random() * 360} />
    </ScrollArea>
  );
};
