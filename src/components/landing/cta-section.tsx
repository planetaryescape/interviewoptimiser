import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32 bg-primary text-white">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl mb-4">
          Elevate Your Interview Skills with MockMate
        </h2>
        <p className="text-xl mb-8">
          Start your journey to interview success with AI-powered practice
          tailored just for you. Your dream job is waiting &ndash; let&apos;s
          prepare you to seize it.
        </p>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/sign-up">Start Your Free Trial Now</Link>
        </Button>
      </div>
    </section>
  );
}
