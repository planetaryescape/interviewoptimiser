import { Check, X } from "lucide-react";
import Link from "next/link";
import SectionTitle from "../ui/SectionTitle";
import SectionWrapper from "../ui/SectionWrapper";

export default function ProblemSolutionSection() {
  const problems = [
    { id: "problem-1", text: "Keyword screens miss high‑potential talent." },
    { id: "problem-2", text: "Interview scheduling blocks your pipeline." },
    { id: "problem-3", text: "One‑way video feels staged, yields thin insight." },
    { id: "problem-4", text: "High costs & time drain for initial screening." },
  ];

  const solutions = [
    { id: "solution-1", text: "Interview every applicant—no CV filter required." },
    { id: "solution-2", text: "Zero calendar friction—candidates click a link, talk anytime." },
    {
      id: "solution-3",
      text: "Our proven adaptive dialogue (refined over 759+ practice sessions) reveals true thinking under pressure.",
    },
    { id: "solution-4", text: "Slash screening costs & free up your recruiters." },
  ];

  return (
    <SectionWrapper className="bg-muted/20" id="features">
      <SectionTitle>The "Shift-Left" Advantage</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
        {/* Problems column */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-6">Common Pain Points</h3>
          <ul className="space-y-4">
            {problems.map((problem) => (
              <li key={problem.id} className="flex items-start gap-3">
                <div className="mt-1 bg-red-100 dark:bg-red-950/30 p-1 rounded-full text-red-600 dark:text-red-400">
                  <X className="h-4 w-4" />
                </div>
                <span>{problem.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Solutions column */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-6">The Interview Optimiser Solution</h3>
          <ul className="space-y-4">
            {solutions.map((solution) => (
              <li key={solution.id} className="flex items-start gap-3">
                <div className="mt-1 bg-green-100 dark:bg-green-950/30 p-1 rounded-full text-green-600 dark:text-green-400">
                  <Check className="h-4 w-4" />
                </div>
                <span>{solution.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link
          href="#how-it-works"
          className="text-primary inline-flex items-center hover:underline"
        >
          See How It Works →
        </Link>
      </div>
    </SectionWrapper>
  );
}
