"use client";

import { Briefcase, ClipboardList, Clock, Layout } from "lucide-react";
import { AnimatedStatCard } from "./animated-stat-card";

interface KeyMetricsSectionProps {
  totalJobs: number;
  totalInterviews: number;
  minutesSpentPracticing: number;
}

export const KeyMetricsSection = ({
  totalJobs,
  totalInterviews,
  minutesSpentPracticing,
}: KeyMetricsSectionProps) => {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-headingSecondary mb-6 text-foreground/90 flex items-center">
        <Layout className="mr-3 h-6 w-6 text-primary opacity-80" /> Key Metrics
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        <AnimatedStatCard
          title="Total Jobs"
          value={totalJobs}
          Icon={Briefcase}
          description="All jobs you&apos;ve added."
        />
        <AnimatedStatCard
          title="Total Interviews"
          value={totalInterviews}
          Icon={ClipboardList}
          description="All interviews you&apos;ve logged."
        />
        <AnimatedStatCard
          title="Practice Minutes"
          value={minutesSpentPracticing}
          Icon={Clock}
          description="Total time spent in completed interviews."
        />
      </div>
    </section>
  );
};
