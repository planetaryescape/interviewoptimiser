import { cn } from "@/lib/utils";
import { Expressions } from "../expressions";
import type { InterviewDataProps } from "./types";

/**
 * Component that displays the interview transcript with speaker roles and prosody information
 */
export function TranscriptSection({
  interview,
  headingFont,
  includeTranscript,
}: InterviewDataProps) {
  if (!includeTranscript || !interview?.data.transcript) {
    return null;
  }

  return (
    <section className="mb-16 bg-slate-50 py-8 border-y border-slate-200">
      <h2
        className={cn(
          "text-base font-semibold text-blue-800 uppercase tracking-widest border-b border-slate-300 pb-2 mb-6 mx-8 w-auto",
          headingFont
        )}
      >
        Interview Transcript
      </h2>
      <div className="px-8 space-y-4 text-sm">
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
              ?.trim();
            return (
              <div
                key={message.content}
                className={cn(
                  "p-4 border-l-2",
                  persona === "Interviewer"
                    ? "border-blue-400 ml-4 bg-white"
                    : "border-blue-600 mr-4"
                )}
              >
                <div className="mb-2">
                  <span
                    className={cn(
                      "font-medium text-xs uppercase tracking-wider",
                      persona === "Interviewer" ? "text-blue-600" : "text-blue-800"
                    )}
                  >
                    {persona}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed mb-2">
                  {message.content?.split("{")?.[0] ?? ""}
                </p>
                {persona === "Candidate" &&
                message.prosody &&
                Object.keys(message.prosody).length > 0 ? (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <p className="text-xs uppercase tracking-wider text-slate-600 mb-2">
                      Vocal characteristics
                    </p>
                    <Expressions values={message.prosody} withScores={false} />
                  </div>
                ) : null}
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}
