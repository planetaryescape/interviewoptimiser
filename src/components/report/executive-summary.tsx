import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { remarkMarkdownComponents } from "../remark-markdown-components";
import type { ReportDataProps } from "./types";

/**
 * Component that displays the executive summary section of the report
 */
export function ExecutiveSummary({ report, headingFont }: ReportDataProps) {
  return (
    <section className="mb-16">
      <div className="flex flex-col">
        <div>
          <h2
            className={cn(
              "text-base font-semibold text-blue-800 uppercase tracking-widest border-b border-slate-300 pb-2 mb-6 w-full",
              headingFont
            )}
          >
            Executive Summary
          </h2>
          <div className="flex gap-8">
            <div className="flex-1 max-w-prose">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  ...remarkMarkdownComponents,
                  p: ({ node, ...props }) => (
                    <p className="mb-4 text-slate-700 leading-relaxed text-sm" {...props} />
                  ),
                }}
                className="text-slate-700"
              >
                {report.data.generalAssessment}
              </ReactMarkdown>
            </div>
            <div className="w-40 flex flex-col items-center border-l border-slate-200 pl-6">
              <div className="mb-3" aria-label={`Overall score: ${report.data.overallScore}%`}>
                <div className="rounded-full w-20 h-20 border-2 border-blue-200 bg-blue-50 flex items-center justify-center">
                  <div className="text-2xl font-semibold text-blue-800">
                    {report.data.overallScore}%
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-600 uppercase tracking-widest text-center mb-3">
                Overall Assessment
              </div>
              <div>
                {report.data.overallScore >= 80 ? (
                  <div className="bg-green-50 border border-green-200 text-green-800 text-xs px-3 py-0.5 font-medium rounded">
                    Distinguished
                  </div>
                ) : report.data.overallScore >= 60 ? (
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-0.5 font-medium rounded">
                    Proficient
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-0.5 font-medium rounded">
                    Developing
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
