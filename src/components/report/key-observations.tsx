import { cn } from "@/lib/utils";
import type { ReportDataProps } from "./types";

/**
 * Component that displays key observations including strengths and areas for improvement
 */
export function KeyObservations({ report, headingFont }: ReportDataProps) {
  return (
    <section className="mb-16">
      <h2
        className={cn(
          "text-base font-semibold text-blue-800 uppercase tracking-widest border-b border-slate-300 pb-2 mb-8 w-full",
          headingFont
        )}
      >
        Key Observations
      </h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="border-l-4 border-green-600 pl-6 pt-1">
          <h3
            className={cn(
              "text-sm font-semibold text-green-800 mb-5 uppercase tracking-wider",
              headingFont
            )}
          >
            Areas of Strength
          </h3>
          <ul className="space-y-4 text-sm">
            {JSON.parse(report.data.areasOfStrength).map((strength: string, index: number) => (
              <li key={strength} className="flex items-start gap-3">
                <span className="text-green-600 font-mono text-xs mt-0.5">{index + 1}.</span>
                <span className="text-slate-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-l-4 border-amber-500 pl-6 pt-1">
          <h3
            className={cn(
              "text-sm font-semibold text-amber-800 mb-5 uppercase tracking-wider",
              headingFont
            )}
          >
            Areas for Development
          </h3>
          <ul className="space-y-4 text-sm">
            {JSON.parse(report.data.areasForImprovement).map((area: string, index: number) => (
              <li key={area} className="flex items-start gap-3">
                <span className="text-amber-600 font-mono text-xs mt-0.5">{index + 1}.</span>
                <span className="text-slate-700">{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
