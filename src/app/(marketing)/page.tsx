import { Hero } from "@/components/hero";
import { CTASection } from "@/components/landing/cta-section";
import { DifferentiatorsSection } from "@/components/landing/differentiators-section";
import { FAQSection } from "@/components/landing/faq-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { SocialProofSection } from "@/components/landing/social-proof-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <>
      <Suspense fallback={null}>
        <ClerkProvider dynamic>
          <Hero />
        </ClerkProvider>
      </Suspense>
      <SocialProofSection />
      <HowItWorksSection />
      <DifferentiatorsSection />
      <TestimonialsSection />
      <FAQSection />
      {!userId && <CTASection />}
    </>
  );
}
