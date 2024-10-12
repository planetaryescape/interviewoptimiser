import { Hero } from "@/components/hero";
import { CTASection } from "@/components/landing/cta-section";
import { FAQSection } from "@/components/landing/faq-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { SocialProofSection } from "@/components/landing/social-proof-section";
import { WhoIsItForSection } from "@/components/landing/who-is-it-for-section";
import { auth } from "@clerk/nextjs/server";

export default async function LandingPage() {
  const { userId } = auth();

  return (
    <>
      <Hero />
      <SocialProofSection />
      <HowItWorksSection />
      <WhoIsItForSection />
      <FAQSection />
      {!userId && <CTASection />}
    </>
  );
}
