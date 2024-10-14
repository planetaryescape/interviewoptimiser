"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Optimization } from "@/db/schema";
import { getRepository } from "@/lib/data/repositoryFactory";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ChevronDown,
  FileDown,
  Save,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";

export default function InterviewReport({
  params,
}: {
  params: { id: string };
}) {
  const { data: optimization } = useQuery({
    queryKey: ["optimization", params.id],
    queryFn: async () => {
      const optimizationRepo = await getRepository<Optimization>(
        "optimizations"
      );
      return await optimizationRepo.getById(params.id);
    },
  });

  const [reportData, setReportData] = useState({
    overallScore: 85,
    strengths: [
      "Clear communication",
      "Relevant experience",
      "Problem-solving skills",
    ],
    areasForImprovement: [
      "Elaborating on answers",
      "Providing more specific examples",
    ],
    keyInsights: [
      "Candidate showed strong technical knowledge",
      "Could improve on relating past experiences to the role",
      "Demonstrated good cultural fit",
    ],
    questionResponses: [
      {
        question: "Tell me about a challenging project you've worked on.",
        response: "I worked on a high-traffic e-commerce platform...",
        feedback:
          "Good overview, but could provide more specific details about your role and contributions.",
        score: 8,
      },
      {
        question: "How do you handle conflicts in a team?",
        response:
          "I believe in open communication and finding common ground...",
        feedback:
          "Solid approach, but consider adding a specific example to illustrate your conflict resolution skills.",
        score: 7,
      },
      {
        question:
          "Explain a complex technical concept to a non-technical person.",
        response: "I would compare a database to a library...",
        feedback:
          "Excellent analogy! Clear and easy to understand for non-technical individuals.",
        score: 9,
      },
    ],
    skillAssessment: {
      technicalSkills: 85,
      communicationSkills: 80,
      problemSolving: 90,
      teamwork: 85,
      adaptability: 75,
    },
    recommendations: [
      "Practice the STAR method (Situation, Task, Action, Result) when answering behavioral questions to provide more structured and detailed responses.",
      "Prepare more specific examples from your past experiences to illustrate your skills and achievements.",
      "Work on tailoring your responses to show how your skills directly apply to the position you're interviewing for.",
      "Consider taking a public speaking course to further enhance your communication skills.",
      "Stay updated with the latest trends in your field to demonstrate your commitment to continuous learning.",
    ],
  });

  const handleSave = () => {
    // Implement save functionality
    console.log("Saving report...");
  };

  const handleExport = (format: "pdf" | "docx") => {
    // Implement export functionality
    console.log(`Exporting report as ${format}...`);
  };

  return (
    <div className="flex flex-col min-h-full overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
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
      <div className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 space-y-8">
              {/* Overall Performance */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  Overall Performance
                </h2>
                <div className="flex items-center mb-4">
                  <div className="w-24 h-24 rounded-full border-8 border-blue-500 flex items-center justify-center text-3xl font-bold text-blue-600">
                    {reportData.overallScore}%
                  </div>
                  <div className="ml-6">
                    {reportData.overallScore >= 80 ? (
                      <ThumbsUp className="w-12 h-12 text-green-500" />
                    ) : reportData.overallScore >= 60 ? (
                      <AlertTriangle className="w-12 h-12 text-yellow-500" />
                    ) : (
                      <ThumbsDown className="w-12 h-12 text-red-500" />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-green-600">
                      Strengths
                    </h3>
                    <ul className="list-disc list-inside space-y-2">
                      {reportData.strengths.map((strength, index) => (
                        <li key={index} className="text-gray-700">
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-red-600">
                      Areas for Improvement
                    </h3>
                    <ul className="list-disc list-inside space-y-2">
                      {reportData.areasForImprovement.map((area, index) => (
                        <li key={index} className="text-gray-700">
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Key Insights */}
              <section>
                <h3 className="text-xl font-semibold mb-3 text-blue-600">
                  Key Insights
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  {reportData.keyInsights.map((insight, index) => (
                    <li key={index} className="text-gray-700">
                      {insight}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Detailed Question Analysis */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  Detailed Question Analysis
                </h2>
                {reportData.questionResponses.map((item, index) => (
                  <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">
                      Question {index + 1}: {item.question}
                    </h3>
                    <p className="mb-2">
                      <strong>Your Response:</strong> {item.response}
                    </p>
                    <p className="mb-2">
                      <strong>Feedback:</strong> {item.feedback}
                    </p>
                    <div className="flex items-center">
                      <strong className="mr-2">Score:</strong>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${item.score * 10}%` }}
                        ></div>
                      </div>
                      <span className="ml-2">{item.score}/10</span>
                    </div>
                  </div>
                ))}
              </section>

              {/* Skill Assessment */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  Skill Assessment
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(reportData.skillAssessment).map(
                    ([skill, score]) => (
                      <div key={skill} className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2 capitalize">
                          {skill.replace(/([A-Z])/g, " $1").trim()}
                        </h3>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                          <span className="ml-2">{score}%</span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>

              {/* Recommendations */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  Recommendations for Improvement
                </h2>
                <ul className="list-decimal list-inside space-y-2">
                  {reportData.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-gray-700">
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
