import { Button } from "@/components/ui/button";
import Link from "next/link";
import { config } from "~/config";

export function CTASection() {
  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-secondary/30 backdrop-blur-sm" />

      {/* Decorative elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-primary/40 to-secondary/20 blur-3xl" />
      <div className="absolute -left-20 bottom-0 w-72 h-72 rounded-full bg-gradient-to-tr from-secondary/30 to-primary/10 blur-2xl" />
      <div className="absolute top-20 left-1/3 w-64 h-64 rounded-full bg-gradient-to-tl from-primary-foreground/10 to-secondary/20 blur-xl opacity-70" />

      <div className="container relative z-10 mx-auto px-4 md:px-6 text-center">
        <h2 className="text-style-h2 text-foreground mb-4">
          Elevate Your Interview Skills with {config.projectName}
        </h2>
        <p className="text-style-body-lead text-foreground/90 mb-8 max-w-2xl mx-auto">
          Start your journey to interview success with AI-powered practice tailored just for you.
          Your dream job is waiting &ndash; let&apos;s prepare you to seize it.
        </p>
        <Button
          size="lg"
          variant="default"
          asChild
          className="text-style-body-base shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6"
        >
          <Link href="/sign-up">Get Started Now</Link>
        </Button>
      </div>
    </section>
  );
}
