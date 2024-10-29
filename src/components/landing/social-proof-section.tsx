import { BackgroundGradient as AnotherBackgroundGradient } from "@/components/background-gradient";
import NumberTicker from "@/components/ui/number-ticker";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/db";
import { statistics } from "@/db/schema";
import { Suspense } from "react";

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

const StatisticsContent = async () => {
  const appStats = await db
    .select()
    .from(statistics)
    .then((result) => result[0]);
  return (
    <>
      <StatisticItem
        value={appStats.minutesCount}
        label="Minutes spent practicing"
      />
      <StatisticItem
        value={appStats.interviewsCount}
        label="Interviews conducted"
      />
      <StatisticItem value={appStats.usersCount} label="Happy Users" />
    </>
  );
};

export function SocialProofSection() {
  return (
    <section className="relative w-full py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <Suspense fallback={<StatisticsContentSkeleton />}>
            <StatisticsContent />
          </Suspense>
        </div>
      </div>
      <AnotherBackgroundGradient degrees={Math.random() * 360} />
    </section>
  );
}
