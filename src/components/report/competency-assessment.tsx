import { Code, MessageCircle, Puzzle, Users } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { remarkMarkdownComponents } from "../remark-markdown-components";
import type { ReportDataProps } from "./types";

/**
 * Component that displays the competency assessment section with detailed scores
 */
export function CompetencyAssessment({ report, headingFont }: ReportDataProps) {
  const competencies = [
    {
      title: "Technical Knowledge",
      content: report.data.technicalKnowledge,
      score: report.data.technicalKnowledgeScore,
      icon: Code,
    },
    {
      title: "Problem-Solving Skills",
      content: report.data.problemSolvingSkills,
      score: report.data.problemSolvingSkillsScore,
      icon: Puzzle,
    },
    {
      title: "Communication Skills",
      content: report.data.communicationSkills,
      score: report.data.communicationSkillsScore,
      icon: MessageCircle,
    },
    {
      title: "Teamwork & Collaboration",
      content: report.data.teamwork,
      score: report.data.teamworkScore,
      icon: Users,
    },
  ];

  return (
    <section className="mb-16 bg-slate-50 py-8 px-8 border-y border-slate-200">
      <h2
        className={cn(
          "text-base font-semibold text-blue-800 uppercase tracking-widest border-b border-slate-300 pb-2 mb-8 w-full",
          headingFont
        )}
      >
        Competency Assessment
      </h2>
      <div className="space-y-10">
        {competencies.map((item, _index) => (
          <div key={item.title} className="border-b border-slate-200 pb-8 last:border-0 last:pb-0">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="mr-3 p-1.5 bg-white rounded-sm border border-slate-300">
                  <item.icon className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className={cn("text-base font-semibold text-slate-800", headingFont)}>
                  {item.title}
                </h3>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center mb-1" aria-label={`Score: ${item.score}%`}>
                  <span className="text-sm font-medium text-slate-700 mr-2">{item.score}%</span>
                  <div className="w-24 h-2 bg-slate-200 rounded-sm overflow-hidden">
                    <div
                      className={cn(
                        "h-full",
                        item.score >= 80
                          ? "bg-green-600"
                          : item.score >= 60
                            ? "bg-blue-600"
                            : "bg-amber-500"
                      )}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs uppercase tracking-wider text-slate-600">
                  {item.score >= 80
                    ? "Distinguished"
                    : item.score >= 60
                      ? "Proficient"
                      : "Developing"}
                </span>
              </div>
            </div>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                ...remarkMarkdownComponents,
                p: ({ node, ...props }) => (
                  <p className="mb-4 text-slate-700 leading-relaxed text-sm" {...props} />
                ),
              }}
              className="text-slate-700 text-sm leading-relaxed pl-9 max-w-prose"
            >
              {item.content}
            </ReactMarkdown>
          </div>
        ))}
      </div>
    </section>
  );
}
