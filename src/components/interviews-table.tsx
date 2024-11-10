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
import { Interview } from "@/db/schema";
import { cn } from "@/lib/utils";
import { idHandler } from "@/lib/utils/idHandler";
import { Loader2, MoreVertical } from "lucide-react";
import Link from "next/link";

interface InterviewsTableProps {
  interviews: Array<
    Interview & {
      id?: number;
    }
  >;
  onDelete?: (id: number) => void;
  deletingId: number | null;
}

export const InterviewsTable = ({
  interviews,
  onDelete,
  deletingId,
}: InterviewsTableProps) => {
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
        {interviews.map((interview) => {
          return (
            <TableRow
              key={interview.id}
              className={cn(
                "transition-all duration-300 border-b border-gray-400 dark:border-gray-600"
              )}
            >
              <TableCell>
                <div>
                  <div className="font-medium">
                    {interview.role || "Role Not Specified"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {interview.company || "Company Not Specified"}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {new Date(interview.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex justify-end items-center space-x-2">
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={`/dashboard/interviews/${idHandler.encode(
                        interview.id ?? 0
                      )}`}
                    >
                      View CV
                    </Link>
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
                                permanently delete the interview and all
                                associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(interview.id!)}
                                disabled={deletingId === interview.id}
                              >
                                {deletingId === interview.id ? (
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
