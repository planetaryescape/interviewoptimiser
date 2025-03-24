import { Badge } from "@/components/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Entity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { format } from "date-fns";
import {
  Brain,
  Calendar,
  ChevronRight,
  FileText,
  Loader2,
  MessageSquare,
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { Report } from "~/db/schema";
import { Skeleton } from "./ui/skeleton";

interface ReportCardProps {
  report: Entity<Report>;
  interviewId: string;
}

export function ReportCard({ report, interviewId }: ReportCardProps) {
  if (!report.data.isCompleted) {
    return (
      <Card className="overflow-hidden border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 group">
        <CardContent className="p-0">
          <div className="p-6 space-y-6">
            <div className="w-full space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-40" />
              </div>

              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full w-full overflow-hidden">
                <div
                  className="h-full bg-gray-200 dark:bg-gray-700 animate-pulse"
                  style={{ width: "65%" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[...Array(4)].map((_, idx) => (
                <div key={`skeleton-item-${idx + 1}`} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-200 dark:bg-gray-700 animate-pulse"
                      style={{ width: `${Math.floor(Math.random() * 30 + 40)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-t border-gray-200 dark:border-gray-800">
            <Button variant="outline" className="w-full" disabled>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Report
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate the overall score badge variant and generate a more descriptive label
  const getScoreVariant = (score: number) => {
    if (score >= 80) return { variant: "success" as const, label: "Excellent" };
    if (score >= 65) return { variant: "warning" as const, label: "Good" };
    return { variant: "destructive" as const, label: "Needs Improvement" };
  };

  const scoreInfo = getScoreVariant(report.data.overallScore);

  return (
    <Card className="overflow-hidden border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 group">
      <CardContent className="p-0">
        {/* Header with score and date */}
        <div className="p-6 pb-5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <span className="text-base font-bold">{report.data.overallScore}%</span>
                <div
                  className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700"
                  style={{
                    clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, 0 ${100 - report.data.overallScore}%)`,
                  }}
                />
                <div
                  className={`absolute inset-0 rounded-full border-2 ${
                    scoreInfo.variant === "success"
                      ? "border-green-500"
                      : scoreInfo.variant === "warning"
                        ? "border-yellow-500"
                        : "border-red-500"
                  }`}
                  style={{
                    clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, 0 ${100 - report.data.overallScore}%)`,
                    borderBottom: "transparent",
                    borderLeft: "transparent",
                    borderRight: "transparent",
                    transform: "rotate(-90deg)",
                  }}
                />
              </div>
              <div>
                <Badge
                  variant={scoreInfo.variant}
                  className="px-2 py-0.5 text-xs uppercase tracking-wide font-medium"
                >
                  {scoreInfo.label}
                </Badge>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Overall Assessment</p>
              </div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(report.data.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </span>
          </div>
        </div>

        {/* Skills assessment section */}
        <div className="px-6 pb-6">
          <TooltipProvider>
            <div className="grid grid-cols-2 gap-6">
              {[
                {
                  icon: Brain,
                  label: "Technical",
                  score: report.data.technicalKnowledgeScore,
                  tooltip: report.data.technicalKnowledge,
                },
                {
                  icon: MessageSquare,
                  label: "Communication",
                  score: report.data.communicationSkillsScore,
                  tooltip: report.data.communicationSkills,
                },
                {
                  icon: Target,
                  label: "Problem Solving",
                  score: report.data.problemSolvingSkillsScore,
                  tooltip: report.data.problemSolvingSkills,
                },
                {
                  icon: Users,
                  label: "Teamwork",
                  score: report.data.teamworkScore,
                  tooltip: report.data.teamwork,
                },
              ].map((skill) => {
                const skillScoreInfo = getScoreVariant(skill.score);

                return (
                  <Tooltip key={skill.label}>
                    <TooltipTrigger asChild>
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <skill.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm font-medium">{skill.label}</span>
                          </div>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {skill.score}%
                          </span>
                        </div>
                        <Progress
                          value={skill.score}
                          className="h-2"
                          indicatorClassName={
                            skillScoreInfo.variant === "success"
                              ? "bg-green-500"
                              : skillScoreInfo.variant === "warning"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={5}>
                      <p className="max-w-xs text-sm">{skill.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        </div>

        {/* Footer with action button */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            asChild
            variant="outline"
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            <Link
              href={`/dashboard/interviews/${interviewId}/reports/${idHandler.encode(
                report.sys.id ?? 0
              )}`}
              className="flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              View Full Report
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
