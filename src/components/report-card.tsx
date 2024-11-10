import { Badge } from "@/components/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Report } from "@/db/schema";
import { Entity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
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
import { Skeleton } from "./ui/skeleton";

interface ReportCardProps {
  report: Entity<Report>;
  interviewId: string;
}

export function ReportCard({ report, interviewId }: ReportCardProps) {
  if (!report.data.isCompleted) {
    return (
      <Card className="hover:shadow-lg transition-all duration-200 group">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="w-full">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-40" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full" disabled>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Report
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                report.data.overallScore >= 80
                  ? "success"
                  : report.data.overallScore >= 65
                  ? "warning"
                  : "destructive"
              }
              className="px-2 py-0.5"
            >
              {report.data.overallScore}% Overall Score
            </Badge>
            <span className="text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 inline mr-1" />
              {new Date(report.data.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <TooltipProvider>
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
            ].map((skill) => (
              <Tooltip key={skill.label}>
                <TooltipTrigger asChild>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <skill.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{skill.label}</span>
                    </div>
                    <Progress
                      value={skill.score}
                      className="h-2"
                      indicatorClassName={
                        skill.score >= 80
                          ? "bg-green-500"
                          : skill.score >= 65
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      {skill.score}%
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{skill.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>

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
      </CardContent>
    </Card>
  );
}
