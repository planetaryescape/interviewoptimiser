import { BackgroundGradient as AnotherBackgroundGradient } from "@/components/background-gradient";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { InferResultType } from "~/db/helpers";
import { InterviewCard } from "./interview-card";

type InterviewWithCandidateDetailsAndJobDescription = InferResultType<
  "interviews",
  {
    candidateDetails: true;
    jobDescription: true;
    report: true;
  }
>;

interface InterviewsGridProps {
  interviews: Array<InterviewWithCandidateDetailsAndJobDescription>;
  onDelete?: (id: number) => void;
  deletingId: number | null;
}

export const InterviewsGrid = ({ interviews, onDelete, deletingId }: InterviewsGridProps) => {
  return (
    <ScrollArea className="relative size-full row-span-1 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 text-card-foreground p-4">
      <div className="size-full grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 auto-rows-max">
        {interviews.map((interview) => (
          <InterviewCard
            key={interview.id}
            interview={interview}
            onDelete={onDelete}
            deletingId={deletingId}
          />
        ))}
      </div>

      <AnotherBackgroundGradient degrees={Math.random() * 360} />
    </ScrollArea>
  );
};
