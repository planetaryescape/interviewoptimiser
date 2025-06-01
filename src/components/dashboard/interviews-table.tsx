"use client";

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
import { cn } from "@/lib/utils";
import { idHandler } from "@/lib/utils/idHandler";
import { ArrowUpDown, Eye, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Defines the structure for a partial report, typically fetched for display in summaries or tables.
 * This should align with the FetchedReportPartial type used in JobReportsPage.
 */
export interface FetchedReportPartial {
  id: number;
  interviewId: number;
  overallScore: number | null;
  fitnessForRoleScore: number | null;
  speakingSkillsScore: number | null;
  communicationSkillsScore: number | null;
  problemSolvingSkillsScore: number | null;
  technicalKnowledgeScore: number | null;
  teamworkScore: number | null;
  adaptabilityScore: number | null;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  recommendation?: string | null; // Added for report recommendation
}

/**
 * Defines the structure for an interview object specifically tailored for the InterviewsTable.
 */
export interface InterviewForTable {
  id: number; // Interview ID
  createdAt: Date | string;
  duration: number; // Duration in seconds (from interview.actualTime)
  type?: string | null; // Interview type (e.g., "Technical", "Behavioral")
  report?: FetchedReportPartial | null;
}

interface InterviewsTableProps {
  interviews: InterviewForTable[];
  jobId: string;
}

const formatDuration = (seconds: number): string => {
  if (seconds === 0) return "-";
  const minutes = Math.round(seconds);
  return `${minutes} min`;
};

export const InterviewsTable = ({ interviews, jobId }: InterviewsTableProps) => {
  const router = useRouter();
  if (!interviews || interviews.length === 0) {
    // This case should ideally be handled by the parent component's empty state
    // but as a fallback:
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No interview reports to display in table.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="sticky top-0 bg-card">
          <TableRow>
            <TableHead className="font-bold">
              <span className="flex items-center">
                Date
                <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
              </span>
            </TableHead>
            <TableHead className="font-bold">
              <span className="flex items-center">
                Type
                <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
              </span>
            </TableHead>
            <TableHead className="font-bold text-right">
              <span className="flex items-center justify-end">
                Duration
                <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
              </span>
            </TableHead>
            <TableHead className="font-bold text-right">
              <span className="flex items-center justify-end">
                Overall Score
                <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
              </span>
            </TableHead>
            <TableHead className="font-bold">
              <span className="flex items-center">
                Recommendation
                <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
              </span>
            </TableHead>
            <TableHead className="font-bold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {interviews.map((interview) => {
            const reportId = interview.report?.id;
            const reportPath = reportId
              ? `/dashboard/jobs/${jobId}/interviews/${idHandler.encode(
                  interview.id
                )}/reports/${idHandler.encode(reportId)}`
              : "#"; // Fallback path if no report ID

            return (
              <TableRow
                key={interview.id}
                className={cn(
                  "transition-all duration-300 border-b border-border hover:bg-muted/50",
                  reportId && "cursor-pointer"
                )}
                onClick={() => {
                  if (reportId) router.push(reportPath);
                }}
              >
                <TableCell className="whitespace-nowrap">
                  {new Date(interview.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{interview.type ?? "N/A"}</TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {formatDuration(interview.duration)}
                </TableCell>
                <TableCell className="text-right">
                  {interview.report?.overallScore?.toFixed(1) ?? "N/A"}
                </TableCell>
                <TableCell>{interview.report?.recommendation ?? "N/A"}</TableCell>
                <TableCell className="text-right">
                  {reportId ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">More actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={reportPath} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" /> View Report
                          </Link>
                        </DropdownMenuItem>
                        {/* Add other actions here if needed */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <span className="text-muted-foreground">No Report</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
