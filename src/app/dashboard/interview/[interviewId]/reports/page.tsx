"use client";

import { Badge } from "@/components/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Report } from "@/db/schema";
import { EntityList } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import { useQuery } from "@tanstack/react-query";
import {
  Brain,
  Calendar,
  ChevronRight,
  FileText,
  MessageSquare,
  RefreshCw,
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function InterviewReportsPage(props: {
  params: Promise<{ interviewId: string }>;
}) {
  const params = use(props.params);

  const {
    data: reportsData,
    isLoading,
    error,
  } = useQuery<EntityList<Report>>({
    queryKey: ["interview-reports", params.interviewId],
    queryFn: async () => {
      const response = await fetch(
        `/api/interviews/${params.interviewId}/reports`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ParticleSwarmLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Error Loading Reports</h1>
        <p className="text-gray-600 mb-8">
          There was an error loading the interview reports.
        </p>
        <Button asChild>
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const reports = reportsData?.data || [];

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Interview Reports</h1>
        <Button asChild>
          <Link
            href={`/dashboard/interview/${params.interviewId}`}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retake Interview
          </Link>
        </Button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Reports Yet</h2>
          <p className="text-gray-600 mb-6">
            Take the interview to generate your first report.
          </p>
          <Button asChild>
            <Link href={`/dashboard/interview/${params.interviewId}`}>
              Start Interview
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => (
            <Card
              key={report.sys.id}
              className="hover:shadow-lg transition-all duration-200 group"
            >
              <CardContent className="p-6">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
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
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {report.data.generalAssessment}
                    </p>
                  </div>
                </div>

                {/* Skills Grid */}
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
                              <span className="text-sm font-medium">
                                {skill.label}
                              </span>
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

                {/* Key Findings */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-green-600">
                        Strengths
                      </h4>
                      <ul className="text-sm space-y-1">
                        {JSON.parse(report.data.areasOfStrength)
                          .slice(0, 2)
                          .map((strength: string, idx: number) => (
                            <li
                              key={idx}
                              className="text-muted-foreground line-clamp-1"
                            >
                              • {strength}
                            </li>
                          ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-amber-600">
                        Areas for Growth
                      </h4>
                      <ul className="text-sm space-y-1">
                        {JSON.parse(report.data.areasForImprovement)
                          .slice(0, 2)
                          .map((area: string, idx: number) => (
                            <li
                              key={idx}
                              className="text-muted-foreground line-clamp-1"
                            >
                              • {area}
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  asChild
                  variant="outline"
                  className="w-full group-hover:border-primary group-hover:text-primary transition-colors"
                >
                  <Link
                    href={`/dashboard/interview/${
                      params.interviewId
                    }/reports/${idHandler.encode(report.sys.id ?? 0)}`}
                    className="flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Full Report
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
