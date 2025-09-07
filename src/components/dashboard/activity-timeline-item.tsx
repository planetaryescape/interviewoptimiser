import { cn } from "@/lib/utils";
import { clientIdHandler } from "@/lib/utils/clientIdHandler";
import { ArrowRight, Briefcase, CalendarDays, Users } from "lucide-react";
import Link from "next/link";
import type { Interview, Job } from "~/db/schema"; // Assuming these types are available

// Combining simplified types for the timeline item
export interface RecentJobItem extends Pick<Job, "id" | "role" | "company" | "createdAt"> {}
export interface RecentInterviewItem {
  interviewId: number;
  reportId: number | null;
  jobRole: string | null;
  interviewType: Interview["type"] | null;
  interviewCreatedAt: Date | null;
  jobId: number;
}

export type TimelineItemData =
  | ({ type: "job" } & RecentJobItem)
  | ({ type: "interview" } & RecentInterviewItem);

interface ActivityTimelineItemProps {
  item: TimelineItemData;
}

export const ActivityTimelineItem = ({ item }: ActivityTimelineItemProps) => {
  const isJob = item.type === "job";
  const title = isJob ? item.role : item.jobRole;
  const subtitle = isJob ? item.company : item.interviewType;
  const date = isJob ? item.createdAt : item.interviewCreatedAt;
  const encodedId = isJob
    ? clientIdHandler.formatId(item.id)
    : clientIdHandler.formatId(item.interviewId);

  let href = "#";
  if (isJob) {
    href = `/dashboard/jobs/${encodedId}`;
  } else if (item.reportId) {
    href = `/dashboard/interviews/${encodedId}/reports/${clientIdHandler.formatId(item.reportId)}`;
  }
  const hasLink = href !== "#";

  return (
    <div className="relative pl-16 py-3 group">
      {/* Timeline Dot and Icon */}
      <div
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 ease-out",
          "bg-card border-2 border-primary/30 group-hover:border-primary group-hover:scale-110 shadow-md",
          isJob
            ? "border-blue-500/30 group-hover:border-blue-500"
            : "border-green-500/30 group-hover:border-green-500"
        )}
      >
        {isJob ? (
          <Briefcase className="h-5 w-5 text-blue-500 group-hover:text-blue-400 transition-colors" />
        ) : (
          <Users className="h-5 w-5 text-green-500 group-hover:text-green-400 transition-colors" />
        )}
      </div>

      {/* Content Card */}
      <div
        className={cn(
          "bg-card border border-border/20 dark:border-border/30 rounded-lg p-4 shadow-sm transition-all duration-300 ease-out",
          "group-hover:shadow-lg group-hover:border-primary/20 dark:group-hover:border-primary/30",
          hasLink && "group-hover:bg-primary/5 dark:group-hover:bg-primary/10"
        )}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1">
          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors text-base">
            {title || "N/A"}
          </h4>
          {date && (
            <div className="flex items-center text-xs text-muted-foreground mt-1 sm:mt-0">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5 opacity-70" />
              {new Date(date).toLocaleDateString()}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-2">{subtitle || "N/A"}</p>

        {hasLink ? (
          <Link
            href={href}
            className="inline-flex items-center text-xs text-primary font-medium group-hover:underline"
          >
            View Details{" "}
            <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <p className="text-xs text-muted-foreground/70">No report available</p>
        )}
      </div>
    </div>
  );
};
