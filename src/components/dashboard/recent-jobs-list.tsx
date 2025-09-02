import { BriefcaseIcon, BuildingOfficeIcon, ClockIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import Link from "next/link";
import { idHandler } from "@/lib/utils/idHandler";

export interface RecentJobItem {
  id: number;
  role: string | null;
  company: string | null;
  createdAt: Date | null;
}

interface RecentJobsListProps {
  jobs: RecentJobItem[];
}

export const RecentJobsList = ({ jobs }: RecentJobsListProps) => {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="bg-card p-6 rounded-lg shadow-md border border-border/20 h-full flex flex-col justify-center items-center">
        <BriefcaseIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium leading-6 text-foreground/90 mb-2">Recent Jobs</h3>
        <p className="text-sm text-muted-foreground">No recent jobs to display.</p>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-md border border-border/20 h-full">
      <h3 className="text-xl font-semibold leading-7 text-foreground/90 mb-6">Recent Jobs</h3>
      <ul className="space-y-6">
        {jobs.map((job) => (
          <li key={job.id}>
            <div className="flex space-x-4 items-start">
              <div>
                <span className="h-10 w-10 rounded-full bg-primary flex items-center justify-center ring-4 ring-primary-foreground/10 dark:ring-primary/20">
                  <BriefcaseIcon className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div>
                  <div className="text-sm">
                    <Link
                      href={`/dashboard/jobs/${idHandler.encode(job.id)}/interviews`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {job.role || "N/A"}
                    </Link>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground flex items-center">
                    <BuildingOfficeIcon className="h-3 w-3 mr-1.5 text-muted-foreground/70" />{" "}
                    {job.company || "N/A"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground flex items-center">
                    <ClockIcon className="h-3 w-3 mr-1.5 text-muted-foreground/70" />
                    Added on{" "}
                    {job.createdAt ? format(new Date(job.createdAt), "MMM d, yyyy") : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
