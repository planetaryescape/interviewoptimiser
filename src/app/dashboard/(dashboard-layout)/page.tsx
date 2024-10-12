"use client";

import { OptimisationsGrid } from "@/components/optimisations-grid";
import { OptimisationsTable } from "@/components/optimisations-table";
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
import {
  CoverLetter,
  Customisation,
  CV,
  Optimization,
  User,
} from "@/db/schema";
import { useUser } from "@/hooks/useUser";
import { getRepository } from "@/lib/data/repositoryFactory";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Grid, List, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  >("optimizations", true);
  return repository.getAll();
}

export default function OptimisationsSection() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [isOutOfCreditsDialogOpen, setIsOutOfCreditsDialogOpen] =
    useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: user } = useUser();
  const router = useRouter();

  const queryClient = useQueryClient();

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
        "optimizations",
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

  const handleOptimizeNewCV = () => {
    if (user && user.credits > 0) {
      router.push("/dashboard/create");
    } else {
      setIsOutOfCreditsDialogOpen(true);
    }
  };

  const NoOptimizationsPlaceholder = () => (
    <div className="flex flex-col items-center justify-center bg-card text-card-foreground h-full text-center p-8">
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
          Optimisations
        </h2>
        <div className="flex items-center space-x-2">
          <Button size="sm" onClick={handleOptimizeNewCV}>
            <span className="hidden md:inline">Optimise New CV</span>
            <Plus className="w-4 h-4 md:hidden" />
          </Button>
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
        <div className="size-full flex items-center justify-center">
          <ParticleSwarmLoader />
        </div>
      ) : error ? (
        <p className="row-span-2 bg-card text-card-foreground p-4">
          Error loading optimizations: {(error as Error).message}
        </p>
      ) : optimizations.length === 0 ? (
        <NoOptimizationsPlaceholder />
      ) : viewMode === "grid" ? (
        <OptimisationsGrid
          optimizations={currentOptimizations.map(
            (optimization) => optimization.data
          )}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      ) : (
        <OptimisationsTable
          optimizations={currentOptimizations.map(
            (optimization) => optimization.data
          )}
          onDelete={handleDelete}
          deletingId={deletingId}
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
      <AlertDialog
        open={isOutOfCreditsDialogOpen}
        onOpenChange={setIsOutOfCreditsDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Out of Credits</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ve run out of credits. Purchase more credits to continue
              optimizing CVs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIsOutOfCreditsDialogOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsOutOfCreditsDialogOpen(false);
                router.push("/pricing");
              }}
            >
              Buy Credits
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
