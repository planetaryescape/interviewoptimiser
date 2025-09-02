import {
  ChatBubbleLeftEllipsisIcon,
  ClockIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import Link from "next/link";
import { idHandler } from "@/lib/utils/idHandler";

export interface RecentInterviewItem {
  interviewId: number;
  reportId: number | null;
  jobRole: string | null;
  interviewType: string | null;
  interviewCreatedAt: Date | null;
  jobId: number;
}

interface RecentInterviewsListProps {
  interviews: RecentInterviewItem[];
}

export const RecentInterviewsList = ({ interviews }: RecentInterviewsListProps) => {
  if (!interviews || interviews.length === 0) {
    return (
      <div className="bg-card p-6 rounded-lg shadow-md border border-border/20 h-full flex flex-col justify-center items-center">
        <ChatBubbleLeftEllipsisIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium leading-6 text-foreground/90 mb-2">Recent Interviews</h3>
        <p className="text-sm text-muted-foreground">No recent interviews to display.</p>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-md border border-border/20 h-full">
      <h3 className="text-xl font-semibold leading-7 text-foreground/90 mb-6">Recent Interviews</h3>
      <ul className="space-y-6">
        {interviews.map((interview) => (
          <li key={interview.interviewId}>
            <div className="flex space-x-4 items-start">
              <div>
                <span className="h-10 w-10 rounded-full bg-primary flex items-center justify-center ring-4 ring-primary-foreground/10 dark:ring-primary/20">
                  <ChatBubbleLeftEllipsisIcon
                    className="h-5 w-5 text-primary-foreground"
                    aria-hidden="true"
                  />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div>
                  <div className="text-sm">
                    <span className="font-medium text-foreground">
                      {interview.jobRole || "N/A"} - {interview.interviewType || "N/A"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground flex items-center">
                    <ClockIcon className="h-3 w-3 mr-1.5 text-muted-foreground/70" />
                    Conducted on{" "}
                    {interview.interviewCreatedAt
                      ? format(new Date(interview.interviewCreatedAt), "MMM d, yyyy")
                      : "N/A"}
                  </p>
                  {interview.reportId && (
                    <p className="mt-1 text-xs">
                      <Link
                        href={`/dashboard/jobs/${idHandler.encode(
                          interview.jobId
                        )}/interviews/${idHandler.encode(
                          interview.interviewId
                        )}/reports/${idHandler.encode(interview.reportId)}`}
                        className="font-medium text-primary hover:text-primary/80 flex items-center"
                      >
                        <DocumentTextIcon className="h-3.5 w-3.5 mr-1" /> View Report
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
