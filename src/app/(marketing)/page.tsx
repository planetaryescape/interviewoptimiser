import { Hero } from "@/components/hero";
import { CTASection } from "@/components/landing/cta-section";
import { DifferentiatorsSection } from "@/components/landing/differentiators-section";
import { FAQSection } from "@/components/landing/faq-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { PricingPreviewSection } from "@/components/landing/pricing-preview-section";
import { SocialProofSection } from "@/components/landing/social-proof-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { Suspense } from "react";

export default async function LandingPage() {
  return (
    <>
      <Suspense fallback={null}>
        <Hero />
      </Suspense>
      <DifferentiatorsSection />
      <HowItWorksSection />
      {/* <VideoTestimonialsSection /> */}
      <SocialProofSection />
      <TestimonialsSection />
      <PricingPreviewSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
