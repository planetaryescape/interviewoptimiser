import { Badge } from "@/components/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Entity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Brain,
  Calendar,
  ChevronRight,
  FileText,
  Lightbulb,
  Loader2,
  MessageSquare,
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Report } from "~/db/schema";
import { Skeleton } from "./ui/skeleton";

interface ReportCardProps {
  report: Entity<Report>;
  interviewId: string;
}

export function ReportCard({ report, interviewId }: ReportCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!report.data.isCompleted) {
    return (
      <Card className="relative overflow-hidden border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md dark:hover:shadow-gray-900/30">
        <CardContent className="p-0">
          {/* Background gradient pulse animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-blue-50/50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 opacity-80 dark:opacity-30 animate-pulse" />

          <div className="relative p-6 space-y-6">
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

          <div className="relative bg-white/80 dark:bg-gray-900/80 p-4 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
            <Button variant="outline" className="w-full relative overflow-hidden" disabled>
              <span className="relative z-10 flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Report
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-indigo-100/30 to-blue-100/30 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-blue-900/30 animate-pulse" />
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

  const scoreInfo = getScoreVariant(report.data.overallScore);

  // Extract strengths from the report
  const getStrengths = () => {
    try {
      const strengths = JSON.parse(report.data.areasOfStrength || "[]");
      return strengths.length > 0 ? strengths[0] : "No strengths identified";
    } catch (e) {
      return "No strengths identified";
    }
  };

  const topStrength = getStrengths();

  const formattedDate = format(new Date(report.data.createdAt), "MMM d, yyyy");

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
        {/* Animated gradient line at top */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
            scoreInfo.color === "green"
              ? "from-emerald-400 via-green-500 to-emerald-600"
              : scoreInfo.color === "yellow"
                ? "from-amber-400 via-yellow-500 to-amber-600"
                : "from-rose-400 via-red-500 to-rose-600"
          }`}
        />

        <CardContent className="p-0">
          <div className="p-6">
            {/* Header with date and score badge */}
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                  <Calendar className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{formattedDate}</span>
              </div>

              <Badge
                variant={scoreInfo.variant}
                className="px-2.5 py-0.5 font-medium text-xs uppercase tracking-wide"
              >
                {scoreInfo.label}
              </Badge>
            </div>

            {/* Score visualization and breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
              {/* Score circle - taking 1/5 of space */}
              <div className="md:col-span-1 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  {/* Background circle */}
                  <svg className="w-24 h-24" aria-label="Score circle">
                    <title>Score circle</title>
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke={
                        scoreInfo.color === "green"
                          ? "rgb(220 252 231)"
                          : scoreInfo.color === "yellow"
                            ? "rgb(254 249 195)"
                            : "rgb(254 226 226)"
                      }
                      strokeWidth="8"
                      className="dark:opacity-30"
                    />
                    {/* Foreground circle showing score percentage */}
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke={
                        scoreInfo.color === "green"
                          ? "rgb(34 197 94)"
                          : scoreInfo.color === "yellow"
                            ? "rgb(234 179 8)"
                            : "rgb(239 68 68)"
                      }
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 40 * (report.data.overallScore / 100)} ${
                        2 * Math.PI * 40 * (1 - report.data.overallScore / 100)
                      }`}
                      strokeDashoffset={2 * Math.PI * 10}
                      transform="rotate(-90, 48, 48)"
                    />
                  </svg>
                  {/* Score percentage in center */}
                  <div className="absolute font-bold text-xl">{report.data.overallScore}%</div>
                </div>
                <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Overall Score
                </span>
              </div>

              {/* Skills grid - 4/5 of space */}
              <div className="md:col-span-4 grid grid-cols-2 gap-4">
                <TooltipProvider>
                  {[
                    {
                      icon: Brain,
                      label: "Technical Knowledge",
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
                          <div className="space-y-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 transition-colors hover:bg-white dark:hover:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <skill.icon
                                  className={cn(
                                    "w-4 h-4",
                                    skillScoreInfo.color === "green"
                                      ? "text-green-500"
                                      : skillScoreInfo.color === "yellow"
                                        ? "text-yellow-500"
                                        : "text-red-500"
                                  )}
                                />
                                <span className="text-sm font-medium">{skill.label}</span>
                              </div>
                              <span className="text-xs font-bold bg-white dark:bg-gray-800 px-2 py-1 rounded-md">
                                {skill.score}%
                              </span>
                            </div>
                            <Progress
                              value={skill.score}
                              className="h-1.5"
                              indicatorClassName={
                                skillScoreInfo.color === "green"
                                  ? "bg-green-500"
                                  : skillScoreInfo.color === "yellow"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={5} className="max-w-[280px]">
                          <p className="text-sm">{skill.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </TooltipProvider>
              </div>
            </div>

            {/* Key insight */}
            <div className="mb-6 px-4 py-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900/50">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                    Key Strength
                  </h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400 line-clamp-2">
                    {topStrength}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with action button */}
          <div className="relative bg-gradient-to-r from-gray-50 to-white dark:from-gray-900/80 dark:to-gray-950 p-4 border-t border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Decorative sparkles that appear on hover */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 dark:via-blue-600 to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{
                scaleX: isHovered ? 1 : 0,
                opacity: isHovered ? 0.7 : 0,
              }}
              transition={{ duration: 0.3 }}
            />

            <Button
              asChild
              variant={isHovered ? "default" : "outline"}
              className="w-full relative transition-all duration-300"
            >
              <Link
                href={`/dashboard/interviews/${interviewId}/reports/${idHandler.encode(
                  report.sys.id ?? 0
                )}`}
                className="flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>View Full Report</span>
                <motion.div
                  animate={{
                    x: isHovered ? 3 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
