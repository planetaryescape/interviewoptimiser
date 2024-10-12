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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { CoverLetter, CV, NewOptimization, Optimization } from "@/db/schema";
import { useUser } from "@/hooks/useUser";
import { getRepository } from "@/lib/data/repositoryFactory";
import { cn } from "@/lib/utils";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { useMutation } from "@tanstack/react-query";
import { Loader2, MoreVertical } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface OptimisationCardProps {
  optimization: Optimization & {
    id?: number;
    cv?: CV;
    coverLetter?: CoverLetter;
  };
  onDelete?: (id: number) => void;
  deletingId: number | null;
}

export const OptimisationCard = ({
  optimization,
  onDelete,
  deletingId,
}: OptimisationCardProps) => {
  const { data: user } = useUser();
  const isCVProcessing = !optimization.isCvComplete;
  const hasCVError = optimization.cvError;
  const hasCV =
    optimization.isCvComplete && !optimization.cvError && optimization.cv;
  const hasCoverLetter =
    optimization.isCoverLetterComplete &&
    !optimization.coverLetterError &&
    optimization.coverLetter;

  const { mutate: handleRetry, isPending } = useMutation({
    mutationFn: async (optimization: NewOptimization) => {
      if (!user || user.credits <= 0) {
        throw new Error("You don't have enough credits to optimise a CV.");
      }

      const optimizationRepository = await getRepository<NewOptimization>(
        "optimizations",
        true
      );
      const result = await optimizationRepository.update(
        idHandler.encode(optimization.id ?? 0),
        {
          ...optimization,
          isCvComplete: false,
          cvError: false,
          coverLetterError: false,
        } satisfies NewOptimization
      );

      // Call the new API endpoint to optimise the CV
      const response = await fetch(`/api/optimise`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          optimizationId: idHandler.encode(result?.sys.id ?? 0),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to optimise CV");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Optimisation retry initiated successfully");
    },
    onError: (error) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "handleRetry");
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });
      toast.error(`Error retrying optimisation: ${error.message}`);
    },
  });

  const getStatusBadge = () => {
    if (optimization.cvError || optimization.coverLetterError) {
      return (
        <Badge
          variant="outline"
          className="border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-300 dark:bg-red-950"
        >
          Error
        </Badge>
      );
    }
    if (optimization.isCvComplete && optimization.isCoverLetterComplete) {
      return (
        <Badge
          variant="outline"
          className="border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-300 dark:bg-green-950"
        >
          Completed
        </Badge>
      );
    }
    if (optimization.isCvComplete) {
      return (
        <Badge
          variant="outline"
          className="border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-950"
        >
          CV Ready
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="border-gray-200 text-gray-700 bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:bg-gray-900"
      >
        Pending
      </Badge>
    );
  };

  return (
    <Card
      className={cn(
        "transition-all duration-300 flex flex-col relative",
        (optimization.cvError || optimization.coverLetterError) &&
          "bg-red-100 dark:bg-red-900"
      )}
    >
      <div className="absolute top-2 right-2">
        <div className="text-xs">{getStatusBadge()}</div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold mb-1">
          {isCVProcessing ? (
            <Skeleton className="h-6 w-3/4" />
          ) : (
            optimization.role || "Role Not Specified"
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {isCVProcessing ? (
            <Skeleton className="h-4 w-1/2" />
          ) : (
            optimization.company || "Company Not Specified"
          )}
        </p>
      </CardHeader>
      <CardContent>
        <CardDescription>
          <div className="space-y-3">
            <p className="text-sm font-medium">
              {isCVProcessing ? (
                <Skeleton className="h-4 w-2/3" />
              ) : (
                optimization.cv?.name || "Candidate Name Not Available"
              )}
            </p>
            <p className="text-sm">
              {isCVProcessing ? (
                <Skeleton className="h-4 w-1/3" />
              ) : (
                `Date: ${new Date(optimization.createdAt).toLocaleDateString()}`
              )}
            </p>
          </div>
          {(optimization.cvError || optimization.coverLetterError) && (
            <p className="text-red-500 mt-2 text-sm">
              An error occurred during optimization, please try again or create
              a new optimization.
            </p>
          )}
        </CardDescription>
      </CardContent>
      <div className="mt-auto p-4 bg-muted/50 border-t border-gray-300 dark:border-gray-700 flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <Button
            asChild={!isCVProcessing}
            size="sm"
            variant={hasCV ? "outline" : "outline"}
            disabled={isCVProcessing}
          >
            {isCVProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing CV
              </>
            ) : hasCVError ? (
              <Button
                disabled={isPending}
                onClick={() => handleRetry(optimization)}
                variant="outline"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Requesting new CV
                  </>
                ) : (
                  "Retry"
                )}
              </Button>
            ) : (
              <Link
                href={`/dashboard/cv/${idHandler.encode(
                  optimization.cv?.id ?? 0
                )}`}
              >
                View CV
              </Link>
            )}
          </Button>

          {hasCV &&
            (hasCoverLetter ? (
              <Button asChild size="sm" variant="outline">
                <Link
                  href={`/dashboard/cover-letter/${idHandler.encode(
                    optimization.coverLetter?.id ?? 0
                  )}`}
                >
                  View Cover Letter
                </Link>
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">
                View CV to generate cover letter
              </span>
            ))}

          {onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the optimization and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete?.(optimization.id)}
                        disabled={deletingId === optimization.id}
                      >
                        {deletingId === optimization.id ? (
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
      </div>
    </Card>
  );
};
