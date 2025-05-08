import { Button } from "@/components/ui/button";
import { BarChart3, FileUp, Link as LinkIcon, Trophy } from "lucide-react";
import SectionTitle from "../ui/SectionTitle";
import SectionWrapper from "../ui/SectionWrapper";

export default function HowItWorksSection() {
  const steps = [
    {
      id: "step-1",
      title: "Upload Job Description",
      description:
        "Our AI engine maps key competencies from your job description and auto‑builds a calibrated, role-specific question set in minutes.",
      icon: <FileUp className="h-8 w-8" />,
    },
    {
      id: "step-2",
      title: "Share Interview Link",
      description:
        "Candidates self‑serve their AI interview—any device, any time zone. No downloads, no scheduling chaos.",
      icon: <LinkIcon className="h-8 w-8" />,
    },
    {
      id: "step-3",
      title: "Review Rich Reports",
      description:
        "Your dashboard updates in real time with recordings, transcripts, and deep analytics. Compare candidates side-by-side.",
      icon: <BarChart3 className="h-8 w-8" />,
    },
    {
      id: "step-4",
      title: "Identify Top Talent & Export",
      description:
        "Intelligent scorecards auto‑rank top performers. One‑click export of all data to your existing ATS/HRIS.",
      icon: <Trophy className="h-8 w-8" />,
    },
  ];

  return (
    <SectionWrapper className="bg-muted/20" id="how-it-works">
      <SectionTitle>How It Works</SectionTitle>

      <div className="mt-12 space-y-12">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col md:flex-row gap-6 md:gap-12">
            <div className="md:w-16 flex flex-row md:flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                {step.icon}
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block h-full w-px bg-border mx-auto my-4" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">
                Step {index + 1}: {step.title}
              </h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button variant="outline">View Sample Scorecard</Button>
        <p className="mt-4 text-sm text-muted-foreground">
          See an anonymised example of our detailed candidate reports
        </p>
      </div>
    </SectionWrapper>
  );
}
