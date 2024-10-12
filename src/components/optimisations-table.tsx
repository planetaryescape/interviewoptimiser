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
import { CoverLetter, CV, Optimization } from "@/db/schema";
import { cn } from "@/lib/utils";
import { idHandler } from "@/lib/utils/idHandler";
import { Loader2, MoreVertical } from "lucide-react";
import Link from "next/link";

interface OptimisationsTableProps {
  optimizations: Array<
    Optimization & {
      id?: number;
      cv?: CV;
      coverLetter?: CoverLetter;
    }
  >;
  onDelete?: (id: number) => void;
  deletingId: number | null;
}

export const OptimisationsTable = ({
  optimizations,
  onDelete,
  deletingId,
}: OptimisationsTableProps) => {
  return (
    <Table className="size-full row-span-1 bg-card text-card-foreground">
      <TableHeader className="sticky top-0 bg-card">
        <TableRow>
          <TableHead className="font-bold">Optimization Details</TableHead>
          <TableHead className="font-bold">Date</TableHead>
          <TableHead className="font-bold">Status</TableHead>
          <TableHead className="font-bold text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {optimizations.map((optimization) => {
          const isCVProcessing =
            !optimization.isCvComplete && !optimization.cvError;
          const hasCV =
            optimization.isCvComplete &&
            !optimization.cvError &&
            optimization.cv;
          const hasCoverLetter =
            optimization.isCoverLetterComplete &&
            !optimization.coverLetterError &&
            optimization.coverLetter;

          return (
            <TableRow
              key={optimization.id}
              className={cn(
                "transition-all duration-300 border-b border-gray-400 dark:border-gray-600",
                (optimization.cvError || optimization.coverLetterError) &&
                  "bg-red-100 dark:bg-red-900"
              )}
            >
              <TableCell>
                <div>
                  <div className="font-medium">
                    {optimization.role || "Role Not Specified"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {optimization.company || "Company Not Specified"}
                  </div>
                  <div className="text-sm">
                    {optimization.cv?.name || "Candidate Name Not Available"}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {new Date(optimization.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {optimization.isCvComplete && optimization.isCoverLetterComplete
                  ? "Completed"
                  : "Pending"}
              </TableCell>
              <TableCell>
                <div className="flex justify-end items-center space-x-2">
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
                      <span className="text-sm text-muted-foreground">
                        Open CV to generate cover letter
                      </span>
                    ))}
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
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-end items-center space-x-2">
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
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                            >
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the optimization and all
                                associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(optimization.id!)}
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
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
