"use client";;
import { use } from "react";

import { remarkMarkdownComponents } from "@/components/remark-markdown-components";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Interview, Report } from "@/db/schema";
import { getRepository } from "@/lib/data/repositoryFactory";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ChevronDown,
  FileDown,
  FileX,
  RefreshCw,
  Save,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function InterviewReport(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = use(props.params);
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

  const handleSave = () => {
    // Implement save functionality
    console.log("Saving report...");
  };

  const handleExport = (format: "pdf" | "docx") => {
    // Implement export functionality
    console.log(`Exporting report as ${format}...`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">
            Loading report...
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950">
        <div className="text-center bg-card p-8 rounded-lg shadow-xl max-w-md">
          <FileX className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-muted-foreground mb-4">
            No Report Available
          </h2>
          <p className="text-muted-foreground mb-6">
            It looks like a report hasn&apos;t been generated for this interview
            yet. This could be because the interview is still in progress or has
            just finished.
          </p>
          <div className="space-y-4">
            <Button asChild variant="default" className="w-full">
              <Link href={`/dashboard`}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Return to Dashboard
              </Link>
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[auto_1fr] min-h-full overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm row-span-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Interview Report
            </h1>
            <div className="flex items-center space-x-4">
              <Button onClick={handleSave} variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Report
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
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
      <div className="row-span-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-auto">
            <div className="p-8 space-y-8">
              {/* Candidate Info */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  Candidate Information
                </h2>
                <p>
                  <strong>Name:</strong> {interview?.data.candidate}
                </p>
                <p>
                  <strong>Company:</strong> {interview?.data.company}
                </p>
                <p>
                  <strong>Role:</strong> {interview?.data.role}
                </p>
              </section>

              {/* Overall Performance */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  Overall Performance
                </h2>
                <div className="flex items-center mb-4">
                  <div className="w-24 h-24 rounded-full border-8 border-blue-500 flex items-center justify-center text-3xl font-bold text-blue-600">
                    {report.overallScore}%
                  </div>
                  <div className="ml-6">
                    {report.overallScore >= 80 ? (
                      <ThumbsUp className="w-12 h-12 text-green-500" />
                    ) : report.overallScore >= 60 ? (
                      <AlertTriangle className="w-12 h-12 text-yellow-500" />
                    ) : (
                      <ThumbsDown className="w-12 h-12 text-red-500" />
                    )}
                  </div>
                </div>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={remarkMarkdownComponents}
                  className="text-gray-700"
                >
                  {report.generalAssessment}
                </ReactMarkdown>
              </section>

              {/* Detailed Feedback */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  Detailed Feedback
                </h2>
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
                  <div key={index} className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <div className="flex items-center mb-2">
                      <div className="w-16 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center text-xl font-bold text-blue-600 mr-4">
                        {item.score}%
                      </div>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={remarkMarkdownComponents}
                        className="text-gray-700 flex-1"
                      >
                        {item.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </section>

              {/* Strengths and Areas for Improvement */}
              <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-green-600">
                      Areas of Strength
                    </h3>
                    <ul className="list-disc list-inside space-y-2">
                      {JSON.parse(report.areasOfStrength).map(
                        (strength: string, index: number) => (
                          <li key={index} className="text-gray-700">
                            {strength}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-red-600">
                      Areas for Improvement
                    </h3>
                    <ul className="list-disc list-inside space-y-2">
                      {JSON.parse(report.areasForImprovement).map(
                        (area: string, index: number) => (
                          <li key={index} className="text-gray-700">
                            {area}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Actionable Next Steps */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  Actionable Next Steps
                </h2>
                <ul className="list-decimal list-inside space-y-2">
                  {JSON.parse(report.actionableNextSteps).map(
                    (step: string, index: number) => (
                      <li key={index} className="text-gray-700">
                        {step}
                      </li>
                    )
                  )}
                </ul>
              </section>

              {/* Interview Transcript */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  Interview Transcript
                </h2>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={remarkMarkdownComponents}
                    className="text-sm text-gray-700"
                  >
                    {interview?.data.transcript}
                  </ReactMarkdown>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
