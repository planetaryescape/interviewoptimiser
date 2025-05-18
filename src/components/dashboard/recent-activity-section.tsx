import { ListChecks } from "lucide-react";
import { type RecentInterviewItem, RecentInterviewsList } from "./recent-interviews-list";
import { type RecentJobItem, RecentJobsList } from "./recent-jobs-list";

interface RecentActivitySectionProps {
  recentJobs: RecentJobItem[];
  recentInterviews: RecentInterviewItem[];
}

export const RecentActivitySection = ({
  recentJobs,
  recentInterviews,
}: RecentActivitySectionProps) => {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-headingSecondary mb-6 text-foreground/90 flex items-center">
        <ListChecks className="mr-3 h-6 w-6 text-primary opacity-80" /> Recent Activity
      </h2>
      {recentJobs.length === 0 && recentInterviews.length === 0 ? (
        <p className="text-muted-foreground text-center py-8 bg-card border border-border/20 rounded-lg shadow-sm">
          No recent activity to display. Start by adding a new job or interview!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <RecentJobsList jobs={recentJobs} />
          </div>
          <div>
            <RecentInterviewsList interviews={recentInterviews} />
          </div>
        </div>
      )}
    </section>
  );
};
