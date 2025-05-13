"use client";

import { Card, CardDescription, CardTitle } from "@/components/acertenity-card";
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
import { idHandler } from "@/lib/utils/idHandler";
import { Building2, Calendar, Loader2, MoreVertical, User2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { InferResultType } from "~/db/helpers";
import { Skeleton } from "./ui/skeleton";

type JobWithCandidateDetailsAndJobDescriptionAndInterviews = InferResultType<
  "jobs",
  {
    candidateDetails: true;
    jobDescription: true;
    interviews: true;
  }
>;

interface JobCardProps {
  job: JobWithCandidateDetailsAndJobDescriptionAndInterviews;
  onDelete?: (id: number) => void;
  deletingId: number | null;
}

export const JobCard = ({ job, onDelete, deletingId }: JobCardProps) => {
  const [open, setOpen] = useState(false);
  const hasInterviews = Boolean(job.interviews.length);

  return (
    <Card
      className={cn(
        "transition-all duration-300 flex flex-col relative overflow-hidden",
        "hover:shadow-lg hover:border-primary/50",
        "group"
      )}
    >
      <CardHeader className="pb-2">
        {!hasInterviews ? (
          <CardTitle className="text-lg font-semibold">
            <Skeleton className="w-full h-6" />
            <div className="text-sm text-muted-foreground">
              <Skeleton className="w-1/2 h-4" />
            </div>
          </CardTitle>
        ) : (
          <CardTitle className="space-y-1 text-xl font-semibold tracking-tight">
            {job.jobDescription?.role || job.role || "Role Not Specified"}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{job.jobDescription?.company || job.company || "Company Not Specified"}</span>
            </div>
          </CardTitle>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        {!hasInterviews ? (
          <CardDescription className="space-y-3 flex flex-col">
            <Skeleton className="w-1/2 h-4" />
            <Skeleton className="w-1/2 h-4" />
          </CardDescription>
        ) : (
          <CardDescription className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <User2 className="h-4 w-4 text-muted-foreground" />
              <span>
                {job.candidateDetails?.name || job.candidate || "Candidate Name Not Available"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </CardDescription>
        )}
      </CardContent>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center bg-muted/50">
        <Button disabled={!hasInterviews} asChild size="sm" variant="secondary" className="w-full">
          <Link
            href={`/dashboard/jobs/${idHandler.encode(job.id ?? 0)}/reports`}
            className="flex items-center justify-center gap-2"
          >
            {!hasInterviews && <Loader2 className="h-4 w-4 animate-spin" />}
            {hasInterviews ? "View Reports" : "Generating Report"}
          </Link>
        </Button>

        {onDelete && (
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="ml-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
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
  );
};
