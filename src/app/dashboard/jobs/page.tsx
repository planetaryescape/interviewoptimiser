"use client";

import * as Sentry from "@sentry/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Grid, List, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { JobsPageHero } from "@/components/dashboard/jobs-page-hero"; // Added import
import { JobsGrid } from "@/components/jobs-grid";
import { JobsTable } from "@/components/jobs-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { useUser } from "@/hooks/useUser";
import { getRepository } from "@/lib/data/repositoryFactory";
import { idHandler } from "@/lib/utils/idHandler";
import type { InferResultType } from "~/db/helpers";
import type { Customisation, Job, User } from "~/db/schema";

type JobWithCandidateDetailsAndJobDescription = InferResultType<
  "jobs",
  {
    candidateDetails: true;
    jobDescription: true;
    interviews: {
      with: {
        report: true;
      };
    };
  }
>;

async function fetchJobs() {
  const repository = await getRepository<
    JobWithCandidateDetailsAndJobDescription & {
      id?: number;
      user?: User & { customization?: Customisation };
    }
  >("jobs", true);
  return repository.getAll();
}

export default function JobsSection() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [isOutOfMinutesDialogOpen, setIsOutOfMinutesDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: user } = useUser();
  const router = useRouter();

  const queryClient = useQueryClient();

  const {
    data: jobsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
    refetchInterval: 3000,
  });

  const jobs = useMemo(() => jobsData?.data || [], [jobsData]);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["user"] });
  }, [queryClient]);

  const itemsPerPage = 9;
  const totalPages = Math.ceil(jobs.length / itemsPerPage);
  const currentJobs = jobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const deleteJobMutation = useMutation({
    mutationFn: async (id: number) => {
      setDeletingId(id);
      const repository = await getRepository<Job>("jobs", true);
      await repository.delete(idHandler.encode(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job deleted successfully");
      setDeletingId(null);
    },
    onError: (error, id) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "deleteJobMutation");
        scope.setExtra("id", id);
        scope.setExtra("error", error);
        scope.setExtra("message", (error as Error).message);

        Sentry.captureException(error);
      });
      toast.error(`Error deleting job: ${(error as Error).message}`);
      setDeletingId(null);
    },
  });

  const handleDelete = (id: number) => {
    deleteJobMutation.mutate(id);
  };

  const handleCreateNewJob = () => {
    if (user && user.minutes > 0) {
      router.push("/dashboard/create");
    } else {
      setIsOutOfMinutesDialogOpen(true);
    }
  };

  const NoJobsPlaceholder = () => (
    <div className="flex flex-col items-center justify-center bg-card text-card-foreground h-full text-center p-8 rounded-lg shadow-md border border-border/20">
      <FileText className="w-16 h-16 text-muted-foreground mb-4" />
      <h3 className="text-2xl font-semibold mb-2">No jobs yet</h3>
      <p className="text-muted-foreground mb-4">Start by creating your first job</p>
      <Button asChild>
        <Link href="/dashboard/create">Create Your First Job</Link>
      </Button>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <JobsPageHero /> {/* Added JobsPageHero component */}
      <div className="flex justify-end items-center">
        <div className="flex items-center space-x-2">
          <Button size="sm" onClick={handleCreateNewJob}>
            <span className="hidden md:inline">Create New Job</span>
            <Plus className="w-4 h-4 md:hidden" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
          >
            {viewMode === "grid" ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="bg-card p-6 rounded-lg shadow-md border border-border/20">
        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <ParticleSwarmLoader />
          </div>
        ) : error ? (
          <p className="text-destructive text-center py-8">
            Error loading jobs: {(error as Error).message}
          </p>
        ) : jobs.length === 0 ? (
          <NoJobsPlaceholder />
        ) : (
          <>
            {viewMode === "grid" ? (
              <JobsGrid
                jobs={currentJobs.map((job) => job.data)}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            ) : (
              <JobsTable
                jobs={currentJobs.map((job) => job.data)}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            )}
            {jobs.length > itemsPerPage && totalPages > 1 && (
              <div className="mt-6 pt-6 flex justify-center border-t border-border/50">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <AlertDialog open={isOutOfMinutesDialogOpen} onOpenChange={setIsOutOfMinutesDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Out of Minutes</AlertDialogTitle>
            <AlertDialogDescription>
              You have used all your available minutes. Please upgrade your plan to create more
              jobs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/dashboard/billing")}>
              Go to Billing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
