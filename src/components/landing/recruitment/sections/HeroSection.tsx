import { Button } from "@/components/ui/button";
import { CTA } from "@/lib/landing/recruitment/constants";
import Link from "next/link";
import SectionWrapper from "../ui/SectionWrapper";

export default function HeroSection() {
  return (
    <SectionWrapper className="min-h-[90vh] flex items-center py-24 md:py-32">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left side - Copy */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Live, adaptive AI interviews—at any scale.
          </h1>
          <p className="text-xl text-muted-foreground">
            Give every candidate a pressure‑tested conversation, cut hiring time in half, and
            surface talent your competitors miss.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button size="lg" asChild>
              <Link href={CTA.b2b.href}>{CTA.b2b.label}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#">Watch 60‑sec Demo</Link>
            </Button>
          </div>
          <div className="pt-2">
            <Link
              href="#"
              className="text-primary inline-flex items-center underline underline-offset-4 hover:text-primary/80"
            >
              Try our AI: 3‑min Interview (no sign‑up)
            </Link>
          </div>
          <div className="pt-2">
            <Link
              href="#candidate-zone"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Job Seeker? Practise your interview skills for free (15 mins daily) →
            </Link>
          </div>
        </div>

        {/* Right side - Visual placeholder */}
        <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Hero animation will be implemented here</p>
        </div>
      </div>
    </SectionWrapper>
  );
}
