import { BackgroundGradient as AnotherBackgroundGradient } from "@/components/background-gradient";
import { OptimisationCard } from "@/components/optimisation-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CoverLetter, CV, Optimization } from "@/db/schema";

interface OptimisationsGridProps {
  optimizations: Array<
    Optimization & {
      id?: number;
      cv?: CV;
      coverLetter?: CoverLetter;
    }
  >;
  onDelete?: (id: number) => void;
  deletingId: number | null;
}

export const OptimisationsGrid = ({
  optimizations,
  onDelete,
  deletingId,
}: OptimisationsGridProps) => {
  return (
    <ScrollArea className="relative size-full row-span-1 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 text-card-foreground p-4">
      <div className="size-full grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 auto-rows-max">
        {optimizations.map((optimization) => (
          <OptimisationCard
            key={optimization.id}
            optimization={optimization}
            onDelete={onDelete}
            deletingId={deletingId}
          />
        ))}
      </div>

      <AnotherBackgroundGradient degrees={Math.random() * 360} />
    </ScrollArea>
  );
};
