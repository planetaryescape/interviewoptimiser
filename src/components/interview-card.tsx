"use client";

import { Card, CardTitle } from "@/components/acertenity-card";
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
import { CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { clientIdHandler } from "@/lib/utils/clientIdHandler";
import { Award, Briefcase, Building2, Calendar, Loader2, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { InferResultType } from "~/db/helpers";

// Type inferred from the database schema for a job and its relations
type InferredJobWithDetails = InferResultType<
  "jobs",
  {
    candidateDetails: true; // This will be ignored in the UI display
    jobDescription: true;
    interviews: true;
    // 'status' is handled by the UI-specific type below
  }
>;

// UI-specific type that extends the inferred type to include an optional status
export interface JobForUICard extends InferredJobWithDetails {
  status?: string | null;
  // 'role', 'company', 'createdAt', etc., are inherited from InferredJobWithDetails if they are direct columns on the 'jobs' table.
}

interface JobCardProps {
  job: JobForUICard;
  onDelete?: (id: number) => void;
  deletingId: number | null;
}

export const JobCard = ({ job, onDelete, deletingId }: JobCardProps) => {
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

  const [open, setOpen] = useState(false);

  return (
    <Link
      href={`/dashboard/jobs/${clientIdHandler.formatId(job.id)}`}
      className="block group h-full"
    >
      <Card
        className={cn(
          "transition-all duration-300 flex flex-col relative overflow-hidden h-full",
          "hover:shadow-lg hover:border-primary/50 border border-border"
        )}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold tracking-tight line-clamp-2">
            {job.jobDescription?.role || job.role || "Role Not Specified"}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
            <Building2 className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {job.jobDescription?.company || job.company || "Company Not Specified"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span>Interviews: {job.interviews?.length || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span>Avg. Score: {calculateAverageScore(job.interviews)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
          <div>
            <span
              className={cn(
                "px-2 py-0.5 text-xs font-medium rounded-full",
                job.status === "Active"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : job.status === "Paused"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              )}
            >
              {job.status || "N/A"}
            </span>
          </div>
        </CardContent>

        <div className="p-3 border-t border-border flex justify-end items-center bg-muted/30 mt-auto">
          {onDelete && (
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger
                asChild
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Button size="icon" variant="ghost" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/jobs/${clientIdHandler.formatId(job.id)}/interviews`}
                    className="w-full cursor-pointer"
                  >
                    View Job
                  </Link>
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                    >
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the job and all
                        associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          setOpen(false);
                          onDelete?.(job.id);
                        }}
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
        </div>
      </Card>
    </Link>
  );
};
