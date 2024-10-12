import NumberTicker from "@/components/ui/number-ticker";
import { Skeleton } from "@/components/ui/skeleton";

const StatisticItem = ({ value, label }: { value: number; label: string }) => (
  <div className="space-y-2">
    <h3 className="text-4xl md:text-8xl font-bold text-foreground">
      <NumberTicker value={value} />
    </h3>
    <p className="text-xl font-medium text-muted-foreground">{label}</p>
  </div>
);

const StatisticSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-10 w-24 mx-auto" />
    <Skeleton className="h-6 w-36 mx-auto" />
  </div>
);

const StatisticsContentSkeleton = () => (
  <>
    <StatisticSkeleton />
    <StatisticSkeleton />
    <StatisticSkeleton />
  </>
);

export function SocialProofSection() {
  return (
    <section className="relative w-full py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl text-center mb-8">
          Why Choose MockMate?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Realism</h3>
            <p>Experience interviews that adapt to your industry and role.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Instant Feedback</h3>
            <p>
              Receive detailed insights on your performance after each session.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Tailored Experience</h3>
            <p>
              Practice with questions based on your CV and target job
              description.
            </p>
          </div>
        </div>
        {/* Add testimonials here */}
      </div>
    </section>
  );
}
