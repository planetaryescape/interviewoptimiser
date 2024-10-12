"use client";

import { OptimisationsGrid } from "@/components/optimisations-grid";
import { OptimisationsTable } from "@/components/optimisations-table";
import { Button } from "@/components/ui/button";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import {
  CoverLetter,
  Customisation,
  CV,
  Optimization,
  User,
} from "@/db/schema";
import { getRepository } from "@/lib/data/repositoryFactory";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Grid, List } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

async function fetchOptimizations() {
  const repository = await getRepository<
    Optimization & {
      id?: number;
      cv?: CV;
      user?: User & { customization?: Customisation };
      coverLetter?: CoverLetter;
    }
  >("admin/optimizations", true);
  return repository.getAll();
}

export default function OptimisationsSection() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    data: optimizationsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["optimizations"],
    queryFn: fetchOptimizations,
    refetchInterval: 3000,
  });

  const optimizations = useMemo(
    () => optimizationsData?.data || [],
    [optimizationsData]
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["user"] });
  }, [optimizations, queryClient]);

  const itemsPerPage = 9;
  const totalPages = Math.ceil(optimizations.length / itemsPerPage);
  const currentOptimizations = optimizations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const deleteOptimizationMutation = useMutation({
    mutationFn: async (id: number) => {
      setDeletingId(id);
      const repository = await getRepository<Optimization>(
        "admin/optimizations",
        true
      );
      await repository.delete(idHandler.encode(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["optimizations"] });
      toast.success("Optimization deleted successfully");
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
      toast.error(`Error deleting optimization: ${(error as Error).message}`);
      setDeletingId(null);
    },
  });

  const handleDelete = (id: number) => {
    deleteOptimizationMutation.mutate(id);
  };

  const NoOptimizationsPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <FileText className="w-16 h-16 text-muted-foreground mb-4" />
      <h3 className="text-2xl font-semibold mb-2">No optimizations yet</h3>
      <p className="text-muted-foreground mb-4">
        Start by creating your first CV optimization
      </p>
      <Button asChild>
        <Link href="/dashboard/create">Create Your First Optimization</Link>
      </Button>
    </div>
  );

  return (
    <section className="h-full grid grid-rows-[auto_1fr_auto]">
      <div className="flex justify-between items-center mb-4 row-span-1">
        <h2 className="text-2xl font-semibold text-foreground">
          Optimisations (Admin)
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
          Error loading optimizations: {(error as Error).message}
        </p>
      ) : optimizations.length === 0 ? (
        <NoOptimizationsPlaceholder />
      ) : viewMode === "grid" ? (
        <OptimisationsGrid
          deletingId={deletingId}
          optimizations={currentOptimizations.map(
            (optimization) => optimization.data
          )}
          onDelete={handleDelete}
        />
      ) : (
        <OptimisationsTable
          deletingId={deletingId}
          optimizations={currentOptimizations.map(
            (optimization) => optimization.data
          )}
          onDelete={handleDelete}
        />
      )}
      {optimizations.length > 0 && (
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
