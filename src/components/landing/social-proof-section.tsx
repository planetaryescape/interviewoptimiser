"use client";

import { BackgroundGradient } from "@/components/background-gradient";
import NumberTicker from "@/components/ui/number-ticker";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { unstable_noStore as noStore } from "next/cache";

const StatisticItem = ({
  value,
  label,
  index,
}: {
  value: number;
  label: string;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.2 }}
    viewport={{ once: true }}
    className="relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500" />
    <div className="relative flex flex-col items-center justify-center space-y-4 p-6 backdrop-blur-sm rounded-xl border border-primary/10 hover:border-primary/20 transition-colors">
      <h3 className="text-style-h3 text-center bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
        <NumberTicker value={value} />
      </h3>
      <div className="h-0.5 w-12 bg-gradient-to-r from-primary to-transparent" />
      <p className="text-style-body-base text-muted-foreground text-center">{label}</p>
    </div>
  </motion.div>
);

const StatisticSkeleton = () => (
  <div className="relative space-y-4 p-6 backdrop-blur-sm rounded-xl border border-primary/10">
    <Skeleton className="h-16 w-32 mx-auto" />
    <div className="h-0.5 w-12 bg-gradient-to-r from-primary/20 to-transparent mx-auto" />
    <Skeleton className="h-8 w-40 mx-auto" />
  </div>
);

const StatisticsContentSkeleton = () => (
  <>
    <StatisticSkeleton />
    <StatisticSkeleton />
    <StatisticSkeleton />
  </>
);

const StatisticsContent = () => {
  noStore();
  const { data: response, isLoading } = useQuery({
    queryKey: ["statistics"],
    queryFn: async () => {
      const res = await fetch("/api/public/statistics");
      if (!res.ok) {
        throw new Error("Failed to fetch statistics");
      }
      return res.json();
    },
  });

  if (isLoading) {
    return <StatisticsContentSkeleton />;
  }

  const statistics = response?.data;

  const stats = [
    {
      value: statistics?.minutesCount ?? 0,
      label: "Minutes of Interview Practice",
    },
    { value: statistics?.interviewsCount ?? 0, label: "Successful Interviews" },
    { value: statistics?.usersCount ?? 0, label: "Career Journeys Enhanced" },
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <StatisticItem key={stat.label} value={stat.value} label={stat.label} index={index} />
      ))}
    </>
  );
};

export function SocialProofSection() {
  return (
    <section className="relative w-full py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="container relative mx-auto px-4 md:px-6"
      >
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-style-h2 bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
            Our Growing Impact
          </h2>
          <p className="text-style-body-lead text-muted-foreground max-w-2xl mx-auto">
            Join our community of professionals who are transforming their interview preparation
            journey with us.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatisticsContent />
        </div>
      </motion.div>
      <BackgroundGradient degrees={45} />
    </section>
  );
}
