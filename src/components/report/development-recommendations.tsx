import { cn } from "@/lib/utils";
import type { ReportDataProps } from "./types";

/**
 * Component that displays professional development recommendations
 */
export function DevelopmentRecommendations({ report, headingFont }: ReportDataProps) {
  return (
    <section className="mb-16 bg-slate-50 py-8 border-y border-slate-200">
      <h2
        className={cn(
          "text-base font-semibold text-blue-800 uppercase tracking-widest border-b border-slate-300 pb-2 mb-6 mx-8 w-auto",
          headingFont
        )}
      >
        Professional Development Recommendations
      </h2>
      <div className="px-8">
        <ol className="space-y-5 list-decimal pl-5 counter-reset text-slate-700">
          {JSON.parse(report.data.actionableNextSteps).map((step: string, _index: number) => (
            <li key={step} className="pl-2 text-sm">
              <p className="leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
