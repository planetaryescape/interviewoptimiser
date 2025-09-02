import { format } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { idHandler } from "@/lib/utils/idHandler";
import type { Report } from "~/db/schema";
import { Skeleton } from "./ui/skeleton";

interface ReportCardProps {
  report?: Report;
  jobId: string;
}

export function ReportCard({ report, jobId }: ReportCardProps) {
  const [_isHovered, setIsHovered] = useState(false);

  if (!report?.isCompleted) {
    return (
      <Card className="relative overflow-hidden border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md dark:hover:shadow-gray-900/30">
        <CardContent className="p-4 space-y-3">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-blue-50/50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 opacity-80 dark:opacity-30 animate-pulse" />
          <div className="relative flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <div className="relative pt-2">
            <Button variant="outline" className="w-full relative overflow-hidden" disabled>
              <span className="relative z-10 flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Report
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate the overall score badge variant and generate a more descriptive label
  const getScoreVariant = (score: number) => {
    if (score >= 80) return { variant: "success" as const, label: "Excellent", color: "green" };
    if (score >= 65) return { variant: "warning" as const, label: "Good", color: "yellow" };
    return { variant: "destructive" as const, label: "Needs Improvement", color: "red" };
  };

  const scoreInfo = getScoreVariant(report.overallScore);

  // Extract strengths from the report
  const getStrengths = () => {
    try {
      const strengths = JSON.parse(report.areasOfStrength || "[]");
      return strengths.length > 0 ? strengths[0] : "No strengths identified";
    } catch (_e) {
      return "No strengths identified";
    }
  };

  const topStrength = getStrengths();

  const formattedDate = format(new Date(report.createdAt), "MMM d, yyyy");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-800 transition-all duration-300 group hover:shadow-xl dark:hover:shadow-gray-900/30">
        <CardContent className="p-0">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</span>
              </div>
              <Badge
                variant={scoreInfo.variant}
                className="px-2 py-0.5 font-medium text-xs tracking-wide"
              >
                {scoreInfo.label}
              </Badge>
            </div>

            <div className="mb-3">
              <span className="text-2xl font-bold text-foreground">{report.overallScore}%</span>
              <span className="text-sm text-muted-foreground ml-1">Overall Score</span>
            </div>

            <div className="mb-4 space-y-1.5">
              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Key Skills
              </h5>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Problem Solving:</span>
                  <span className="font-medium text-foreground">
                    {report.problemSolvingSkillsScore}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Communication:</span>
                  <span className="font-medium text-foreground">
                    {report.communicationSkillsScore}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tech Knowledge:</span>
                  <span className="font-medium text-foreground">
                    {report.technicalKnowledgeScore}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Role Fit:</span>
                  <span className="font-medium text-foreground">{report.fitnessForRoleScore}%</span>
                </div>
              </div>
            </div>

            {topStrength !== "No strengths identified" && (
              <div className="mb-4">
                <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
                  Top Strength
                </h5>
                <p className="text-xs text-foreground truncate">{topStrength}</p>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-800/30 px-4 py-3 border-t border-gray-200 dark:border-gray-800">
              <Link
                href={`/dashboard/jobs/${jobId}/interviews/${idHandler.encode(report.interviewId)}/reports/${idHandler.encode(report.id)}`}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-primary hover:bg-primary/5 dark:hover:bg-primary/10 border-primary/50 hover:border-primary/70"
                >
                  View Full Report <ChevronRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
