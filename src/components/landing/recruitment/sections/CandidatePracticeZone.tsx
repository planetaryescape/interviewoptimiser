import { Button } from "@/components/ui/button";
import { CTA } from "@/lib/landing/recruitment/constants";
import Link from "next/link";
import SectionWrapper from "../ui/SectionWrapper";

export default function CandidatePracticeZone() {
  const stats = [
    { value: "721+", label: "Minutes of Live Interview Practice Logged" },
    { value: "759+", label: "Adaptive AI Interviews Successfully Completed" },
    { value: "120+", label: "Career Journeys Enhanced Through Practice" },
  ];

  return (
    <SectionWrapper className="bg-muted/30" id="candidate-zone">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Job Seekers: Ace Your Next Interview – Practise for Free!
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Join over <span className="font-medium">120+ individuals</span> who are already mastering
          their interview skills with our adaptive AI. Get{" "}
          <span className="font-medium">
            15 minutes of free, dynamic interview practice every day
          </span>
          . No catch, just real improvement.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</span>
              <span className="text-sm text-muted-foreground text-center">{stat.label}</span>
            </div>
          ))}
        </div>

        <Button size="lg" asChild>
          <Link href={CTA.b2c.href}>{CTA.b2c.label}</Link>
        </Button>
      </div>
    </SectionWrapper>
  );
}
