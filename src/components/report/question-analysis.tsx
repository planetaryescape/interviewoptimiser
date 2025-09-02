import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { EntityList } from "@/lib/utils/formatEntity";
import type { QuestionAnalysis } from "~/db/schema";
import { remarkMarkdownComponents } from "../remark-markdown-components";
import type { ReportComponentBaseProps } from "./types";

interface QuestionAnalysisProps extends ReportComponentBaseProps {
  questionAnalyses?: EntityList<QuestionAnalysis>;
}

/**
 * Component that displays question analysis section with ratings and feedback
 */
export function QuestionAnalysisSection({ questionAnalyses, headingFont }: QuestionAnalysisProps) {
  if (!questionAnalyses?.data || questionAnalyses.data.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      <h2
        className={cn(
          "text-base font-semibold text-blue-800 uppercase tracking-widest border-b border-slate-300 pb-2 mb-6 w-full",
          headingFont
        )}
      >
        Key Question Analysis
      </h2>
      <div className="space-y-6">
        {questionAnalyses.data.map((item) => (
          <div key={item.data.id} className="border border-slate-200 rounded-sm">
            <div className="bg-slate-50 p-4 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h3 className={cn("text-sm font-semibold text-slate-800", headingFont)}>
                  {item.data.question}
                </h3>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-slate-700 mr-2">
                    {item.data.score}%
                  </span>
                  <div className="w-20 h-2 bg-slate-200 rounded-sm overflow-hidden">
                    <div
                      className={cn(
                        "h-full",
                        item.data.score >= 80
                          ? "bg-green-600"
                          : item.data.score >= 60
                            ? "bg-blue-600"
                            : "bg-amber-500"
                      )}
                      style={{ width: `${item.data.score}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  ...remarkMarkdownComponents,
                  p: ({ node, ...props }) => (
                    <p className="mb-4 text-slate-700 leading-relaxed text-sm" {...props} />
                  ),
                }}
                className="text-slate-700 text-sm leading-relaxed"
              >
                {item.data.analysis}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
