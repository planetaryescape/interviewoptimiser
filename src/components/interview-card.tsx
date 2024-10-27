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
import { Interview, Report } from "@/db/schema";
import { cn } from "@/lib/utils";
import { idHandler } from "@/lib/utils/idHandler";
import { Loader2, MoreVertical } from "lucide-react";
import Link from "next/link";

interface InterviewCardProps {
  interview: Interview & {
    id?: number;
    report?: Report;
  };
  onDelete?: (id: number) => void;
  deletingId: number | null;
}

export const InterviewCard = ({
  interview,
  onDelete,
  deletingId,
}: InterviewCardProps) => {
  return (
    <Card className={cn("transition-all duration-300 flex flex-col relative")}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold mb-1">
          {interview.role || "Role Not Specified"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {interview.company || "Company Not Specified"}
        </p>
      </CardHeader>
      <CardContent>
        <CardDescription className="space-y-3">
          <span className="text-sm font-medium">
            {"Candidate Name Not Available"}
          </span>
          <span className="text-sm">
            Date: {new Date(interview.createdAt).toLocaleDateString()}
          </span>
        </CardDescription>
      </CardContent>
      <div className="mt-auto p-4 bg-muted/50 border-t border-gray-300 dark:border-gray-700 flex justify-between items-center">
        <div className="flex gap-2 items-center justify-between w-full">
          <Button
            disabled={!interview.report}
            asChild
            size="sm"
            variant={"outline"}
          >
            <Link
              href={`/dashboard/interview/${idHandler.encode(
                interview.id ?? 0
              )}/report`}
              className="flex items-center"
            >
              {!interview.report && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {interview.report ? "View Report" : "Generating Report"}
            </Link>
          </Button>

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
                        delete the interview and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete?.(interview.id)}
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
      </div>
    </Card>
  );
};
