"use client";

import { InterviewsGrid } from "@/components/interviews-grid";
import { InterviewsTable } from "@/components/interviews-table";
import { Button } from "@/components/ui/button";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { Interview } from "@/db/schema";
import { getRepository } from "@/lib/data/repositoryFactory";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Grid, List } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

async function fetchInterviews() {
  const repository = await getRepository<Interview>("admin/interviews", true);
  return repository.getAll();
}

export default function InterviewsSection() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    data: interviewsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["interviews-admin"],
    queryFn: fetchInterviews,
    refetchInterval: 3000,
  });

  const interviews = useMemo(
    () => interviewsData?.data || [],
    [interviewsData]
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["user"] });
  }, [interviews, queryClient]);

  const itemsPerPage = 9;
  const totalPages = Math.ceil(interviews.length / itemsPerPage);
  const currentInterviews = interviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const deleteOptimizationMutation = useMutation({
    mutationFn: async (id: number) => {
      setDeletingId(id);
      const repository = await getRepository<Interview>(
        "admin/interviews",
        true
      );
      await repository.delete(idHandler.encode(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      toast.success("Interview deleted successfully");
      setDeletingId(null);
    },
    onError: (error, id) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "deleteOptimizationMutation");
        scope.setExtra("id", id);
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });
      toast.error(`Error deleting interview: ${(error as Error).message}`);
      setDeletingId(null);
    },
  });

  const handleDelete = (id: number) => {
    deleteOptimizationMutation.mutate(id);
  };

  const NoInterviewsPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <FileText className="w-16 h-16 text-muted-foreground mb-4" />
      <h3 className="text-2xl font-semibold mb-2">No interviews yet</h3>
      <p className="text-muted-foreground mb-4">
        Start by creating your first interview
      </p>
      <Button asChild>
        <Link href="/dashboard/create">Create Your First Interview</Link>
      </Button>
    </div>
  );

  return (
    <section className="h-full grid grid-rows-[auto_1fr_auto]">
      <div className="flex justify-between items-center mb-4 row-span-1">
        <h2 className="text-2xl font-semibold text-foreground">
          Interviews (Admin)
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
          >
            {viewMode === "grid" ? (
              <Grid className="h-4 w-4" />
            ) : (
              <List className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      {isLoading ? (
        <div className="size-full bg-card text-card-foreground flex items-center justify-center">
          <ParticleSwarmLoader />
        </div>
      ) : error ? (
        <p className="row-span-2 bg-background text-foreground p-4">
          Error loading interviews: {(error as Error).message}
        </p>
      ) : interviews.length === 0 ? (
        <NoInterviewsPlaceholder />
      ) : viewMode === "grid" ? (
        <InterviewsGrid
          deletingId={deletingId}
          interviews={currentInterviews.map((interview) => interview.data)}
          onDelete={handleDelete}
        />
      ) : (
        <InterviewsTable
          deletingId={deletingId}
          interviews={currentInterviews.map((interview) => interview.data)}
          onDelete={handleDelete}
        />
      )}
      {interviews.length > 0 && (
        <div className="mt-4 flex justify-center row-span-1">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
