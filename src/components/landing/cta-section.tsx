import { SectionTitle } from "@/components/common/section-title";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { config } from "~/config";

export function CTASection() {
  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <SectionTitle as="h2" variant="h2" className="mb-4">
          Elevate Your Interview Skills with {config.projectName}
        </SectionTitle>
        <p className="text-style-body-lead mb-8">
          Start your journey to interview success with AI-powered practice tailored just for you.
          Your dream job is waiting &ndash; let&apos;s prepare you to seize it.
        </p>
        <Button size="lg" variant="secondary" asChild className="text-style-body-base">
          <Link href="/sign-up">Get Started Now</Link>
        </Button>
      </div>
    </section>
  );
}
