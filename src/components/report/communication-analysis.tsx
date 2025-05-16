import { cn } from "@/lib/utils";
import { RadialProsodyChart } from "../radial-prosody-chart";
import type { InterviewDataProps } from "./types";

/**
 * Aggregates prosody data from transcript messages for visualization
 */
function aggregateProsodyData(transcript: string) {
  const messages = JSON.parse(transcript || "[]");

  const prosodyTotals: { [key: string]: number } = {};
  let totalMessages = 0;

  for (const message of messages) {
    if (message.role === "user" && message.prosody) {
      totalMessages++;
      for (const [key, value] of Object.entries(message.prosody)) {
        prosodyTotals[key] = (prosodyTotals[key] || 0) + (value as number);
      }
    }
  }

  const result = Object.entries(prosodyTotals)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round((value / totalMessages) * 100),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return result;
}

/**
 * Component that displays communication pattern analysis with a radial chart
 */
export function CommunicationAnalysis({
  interview,
  headingFont,
  includeTranscript,
}: InterviewDataProps) {
  if (!includeTranscript || !interview?.data.transcript) {
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
        Communication Pattern Analysis
      </h2>
      <div className="border border-slate-200 p-8">
        <p className="text-slate-700 mb-8 text-sm max-w-prose leading-relaxed">
          The following analysis presents a quantitative assessment of vocal characteristics
          exhibited during the interview. The data visualization below illustrates the prevalence of
          each characteristic, with the radial distance from center representing frequency of
          occurrence in the candidate&apos;s responses.
        </p>
        <div
          className="w-full mb-8"
          aria-label="Vocal characteristics chart showing the prevalence of different speech patterns"
        >
          <RadialProsodyChart data={aggregateProsodyData(interview?.data.transcript ?? "[]")} />
        </div>
        <div className="mt-8 text-xs text-slate-600 italic border-t border-slate-200 pt-4">
          <p>
            <span className="font-semibold">Methodology note:</span> Values represent percentage of
            responses where each characteristic was detected at significant levels. Analysis is
            limited to the six most prevalent characteristics for clarity of presentation.
          </p>
        </div>
      </div>
    </section>
  );
}
