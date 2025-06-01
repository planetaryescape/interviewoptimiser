import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { idHandler } from "@/lib/utils/idHandler";
import { ArrowUpDown, Loader2, MoreVertical } from "lucide-react";
import Link from "next/link";
import type { InferResultType } from "~/db/helpers";

// Type inferred from the database schema for a job and its relations
type InferredJobWithDetails = InferResultType<
  "jobs",
  {
    candidateDetails: true;
    jobDescription: true;
    interviews: true;
    // 'status' is problematic with direct inference, so we handle it below
  }
>;

// UI-specific type that extends the inferred type to include an optional status
// This allows the component to expect 'status' without breaking if the base type doesn't provide it directly.
export interface JobForUITable extends InferredJobWithDetails {
  status?: string | null;
}

interface JobsTableProps {
  jobs: Array<JobForUITable>;
  onDelete?: (id: number) => void;
  deletingId: number | null;
}

export const JobsTable = ({ jobs, onDelete, deletingId }: JobsTableProps) => {
  const calculateTotalInterviewMinutes = (
    interviews: Array<{ actualTime?: number | null; [key: string]: any }> | undefined
  ): string => {
    if (!interviews || interviews.length === 0) {
      return "-";
    }
    // Assuming 'actualTime' is in seconds for each interview object from the 'jobs' table relation
    const totalSeconds = interviews.reduce(
      (acc, interview) => acc + (interview.actualTime || 0),
      0
    );
    if (totalSeconds === 0) {
      return "-";
    }
    const totalMinutes = Math.round(totalSeconds / 60);
    return `${totalMinutes} min`;
  };

  const calculateAverageScore = (
    interviews: Array<{ overallScore?: number | null; [key: string]: any }> | undefined
  ): string => {
    if (!interviews || interviews.length === 0) {
      return "-";
    }
    const validScores = interviews
      .map((interview) => interview.overallScore)
      .filter((score) => typeof score === "number") as number[];

    if (validScores.length === 0) {
      return "-";
    }
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    const average = sum / validScores.length;
    return average.toFixed(1);
  };

  return (
    <Table className="size-full row-span-1 bg-card text-card-foreground">
      <TableHeader className="sticky top-0 bg-card">
        <TableRow>
          <TableHead className="font-bold">
            <span className="flex items-center">
              Job Role
              <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
            </span>
          </TableHead>
          <TableHead className="font-bold">
            <span className="flex items-center">
              Company
              <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
            </span>
          </TableHead>
          <TableHead className="font-bold text-right">Interviews</TableHead>
          <TableHead className="font-bold text-right">
            <span className="flex items-center justify-end">
              Avg. Score
              <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
            </span>
          </TableHead>
          <TableHead className="font-bold text-right">Mins Interviewed</TableHead>
          <TableHead className="font-bold">
            <span className="flex items-center">
              Date
              <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
            </span>
          </TableHead>
          <TableHead className="font-bold">Status</TableHead>
          <TableHead className="font-bold text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => {
          return (
            <TableRow
              key={job.id}
              className={cn(
                "transition-all duration-300 border-b border-border hover:bg-muted/50 cursor-pointer"
              )}
            >
              <TableCell>
                <Link
                  href={`/dashboard/jobs/${idHandler.encode(job.id ?? 0)}/interviews`}
                  className="block hover:underline"
                >
                  {job.jobDescription?.role || job.role || "N/A"}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/dashboard/jobs/${idHandler.encode(job.id ?? 0)}/interviews`}
                  className="block hover:underline"
                >
                  {job.jobDescription?.company || job.company || "N/A"}
                </Link>
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/dashboard/jobs/${idHandler.encode(job.id ?? 0)}/interviews`}
                  className="block"
                >
                  {job.interviews?.length || 0}
                </Link>
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/dashboard/jobs/${idHandler.encode(job.id ?? 0)}/interviews`}
                  className="block"
                >
                  {calculateAverageScore(job.interviews)}
                </Link>
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                <Link
                  href={`/dashboard/jobs/${idHandler.encode(job.id ?? 0)}/interviews`}
                  className="block"
                >
                  {calculateTotalInterviewMinutes(job.interviews)}
                </Link>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <Link
                  href={`/dashboard/jobs/${idHandler.encode(job.id ?? 0)}/interviews`}
                  className="block"
                >
                  {new Date(job.createdAt).toLocaleDateString()}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/dashboard/jobs/${idHandler.encode(job.id ?? 0)}/interviews`}
                  className="block"
                >
                  {/* We can use a Badge component here in the future if available */}
                  <span
                    className={cn(
                      "px-2 py-1 text-xs font-medium rounded-full",
                      job.status === "Active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : job.status === "Paused"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    )}
                  >
                    {job.status || "N/A"}
                  </span>
                </Link>
              </TableCell>
              <TableCell className="text-right">
                {onDelete && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/dashboard/jobs/${idHandler.encode(job.id ?? 0)}/interviews`}
                          className="w-full"
                        >
                          View Job
                        </Link>
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()} // Prevent closing dropdown immediately
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          >
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this job
                              and all associated interviews and reports.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(job.id!)}
                              disabled={deletingId === job.id}
                              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                              {deletingId === job.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                "Delete"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
