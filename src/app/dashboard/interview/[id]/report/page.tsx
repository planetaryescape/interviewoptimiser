"use client";

import { Expressions } from "@/components/expressions";
import { remarkMarkdownComponents } from "@/components/remark-markdown-components";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Interview, Report } from "@/db/schema";
import { config } from "@/lib/config";
import { getRepository } from "@/lib/data/repositoryFactory";
import { cn } from "@/lib/utils";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  BarChart2,
  Briefcase,
  ChevronDown,
  FileDown,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  User,
  UserCircle,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

export default function InterviewReport({
  params,
}: {
  params: { id: string };
}) {
  const queryClient = useQueryClient();
  const { data: interview, isLoading } = useQuery({
    queryKey: ["interview", params.id],
    queryFn: async () => {
      const interviewRepo = await getRepository<
        Interview & {
          report: Report;
        }
      >("interviews");
      return await interviewRepo.getById(params.id);
    },
  });

  const report = interview?.data.report;

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ interviewId: params.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interview", params.id] });
    },
    onError: (error) => {
      toast.error("Failed to generate report. Please try again.");
      Sentry.withScope((scope) => {
        scope.setContext("params", params);
        Sentry.captureException(error);
      });
    },
  });

  useEffect(() => {
    if (
      !isLoading &&
      interview?.data &&
      !report &&
      !generateReportMutation.isPending
    ) {
      generateReportMutation.mutate();
    }
  }, [report, generateReportMutation]);

  const handleExport = (format: "pdf" | "docx") => {
    // Implement export functionality
    console.log(`Exporting report as ${format}...`);
  };

  const [includeTranscript, setIncludeTranscript] = useState(true);

  if (isLoading || generateReportMutation.isPending || !report) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-xl max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Generating Report
          </h2>
          <p className="text-gray-600 mb-6">
            Please wait while we generate the report for your interview. This
            may take a few moments.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div className="bg-blue-600 h-2.5 rounded-full w-3/4 animate-pulse"></div>
          </div>
          <p className="text-sm text-gray-500">
            This process usually takes about 1-2 minutes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-blue-50 dark:bg-blue-950">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-card text-card-foreground shadow-sm mb-8 border-b border-gray-400 dark:border-gray-600">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-semibold">Interview Report</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-transcript"
                  checked={includeTranscript}
                  onCheckedChange={setIncludeTranscript}
                />
                <Label htmlFor="include-transcript">Include Transcript</Label>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="">
                    <FileDown className="w-4 h-4 mr-2" />
                    Export
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("docx")}>
                    Export as DOCX
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <ScrollArea className="h-[calc(100vh-8rem)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-[21cm] mx-auto bg-white shadow-lg">
          <div
            className="py-12 px-8 sm:px-12 space-y-8"
            style={{ fontSize: "11pt" }}
          >
            {/* Header */}
            <header className="text-center mb-8">
              <Image
                src="/logo.png"
                alt={`${config.projectName} Logo`}
                width={200}
                height={200}
                className="mx-auto"
              />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Interview Optimiser Report
              </h1>
              <p className="text-xl text-gray-600">
                {interview?.data.candidate} - {interview?.data.role}
              </p>
            </header>

            {/* Candidate Info */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Candidate Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center">
                  <User className="w-5 h-5 mr-3 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{interview?.data.candidate}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-3 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="font-medium">{interview?.data.company}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <UserCircle className="w-5 h-5 mr-3 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium">{interview?.data.role}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Overall Performance */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Overall Performance
              </h2>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <BarChart2 className="w-10 h-10 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-gray-800">
                      {report.overallScore}%
                    </p>
                    <p className="text-gray-500">Overall Score</p>
                  </div>
                </div>
                <div>
                  {report.overallScore >= 80 ? (
                    <div className="flex items-center text-green-600">
                      <ThumbsUp className="w-8 h-8 mr-2" />
                      <span className="text-lg font-semibold">Excellent</span>
                    </div>
                  ) : report.overallScore >= 60 ? (
                    <div className="flex items-center text-yellow-600">
                      <AlertTriangle className="w-8 h-8 mr-2" />
                      <span className="text-lg font-semibold">Good</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <AlertTriangle className="w-8 h-8 mr-2" />
                      <span className="text-lg font-semibold">
                        Needs Improvement
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={remarkMarkdownComponents}
                className="text-gray-700 leading-relaxed"
              >
                {report.generalAssessment}
              </ReactMarkdown>
            </section>

            {/* Detailed Feedback */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Detailed Feedback
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: "Speaking Skills",
                    content: report.speakingSkills,
                    score: report.speakingSkillsScore,
                  },
                  {
                    title: "Communication Skills",
                    content: report.communicationSkills,
                    score: report.communicationSkillsScore,
                  },
                  {
                    title: "Problem-Solving Skills",
                    content: report.problemSolvingSkills,
                    score: report.problemSolvingSkillsScore,
                  },
                  {
                    title: "Technical Knowledge",
                    content: report.technicalKnowledge,
                    score: report.technicalKnowledgeScore,
                  },
                  {
                    title: "Teamwork",
                    content: report.teamwork,
                    score: report.teamworkScore,
                  },
                  {
                    title: "Adaptability",
                    content: report.adaptability,
                    score: report.adaptabilityScore,
                  },
                ].map((item, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {item.title}
                      </h3>
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-xl font-bold text-blue-600">
                            {item.score}%
                          </span>
                        </div>
                        {item.score >= 80 ? (
                          <TrendingUp className="w-6 h-6 text-green-500" />
                        ) : item.score >= 60 ? (
                          <TrendingUp className="w-6 h-6 text-yellow-500" />
                        ) : (
                          <TrendingDown className="w-6 h-6 text-red-500" />
                        )}
                      </div>
                    </div>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={remarkMarkdownComponents}
                      className="text-gray-700"
                    >
                      {item.content}
                    </ReactMarkdown>
                  </div>
                ))}
              </div>
            </section>

            {/* Strengths and Areas for Improvement */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Strengths and Areas for Improvement
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-green-600">
                    Areas of Strength
                  </h3>
                  <ul className="space-y-3">
                    {JSON.parse(report.areasOfStrength).map(
                      (strength: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <ThumbsUp className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                          <span className="text-gray-700">{strength}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-red-600">
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-3">
                    {JSON.parse(report.areasForImprovement).map(
                      (area: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <AlertTriangle className="w-5  h-5 text-red-500 mr-3 flex-shrink-0 mt-1" />
                          <span className="text-gray-700">{area}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </section>

            {/* Actionable Next Steps */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Actionable Next Steps
              </h2>

              <ol className="space-y-4 list-decimal list-inside">
                {JSON.parse(report.actionableNextSteps).map(
                  (step: string, index: number) => (
                    <li key={index} className="pl-2 py-3 bg-blue-50 rounded-lg">
                      <span className="text-gray-700 ml-2">{step}</span>
                    </li>
                  )
                )}
              </ol>
            </section>

            {/* Interview Transcript */}
            {includeTranscript && (
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                  Interview Transcript
                </h2>
                <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
                  {JSON.parse(interview?.data.transcript ?? "[]").map(
                    (
                      message: {
                        role: string;
                        content: string;
                        prosody: Record<string, number>;
                      },
                      index: number
                    ) => {
                      const persona = message.role
                        .replace("assistant", "Interviewer")
                        .replace("user", "Candidate")
                        .trim();
                      return (
                        <div key={index} className="mb-4 last:mb-0">
                          <span
                            className={cn(
                              "font-semibold text-blue-600 block mb-1",
                              persona === "Candidate" && "text-green-600"
                            )}
                          >
                            {persona}:
                          </span>
                          <p className="text-gray-700 bg-white p-3 rounded-lg shadow-sm">
                            <span className="block mb-2">
                              {message.content}
                            </span>
                            {persona === "Candidate" &&
                              Object.keys(message.prosody).length > 0 && (
                                <Expressions
                                  values={message.prosody}
                                  withScores={false}
                                />
                              )}
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>
              </section>
            )}

            {/* Footer */}
            <footer className="text-center text-gray-500 text-sm mt-8 pt-4 border-t">
              <p>
                Generated on {new Date().toLocaleDateString()} by Interview
                Optimiser
              </p>
            </footer>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
