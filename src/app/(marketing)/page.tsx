import { Hero } from "@/components/hero";
import { CTASection } from "@/components/landing/cta-section";
import { FAQSection } from "@/components/landing/faq-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { SocialProofSection } from "@/components/landing/social-proof-section";
import { auth } from "@clerk/nextjs/server";

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <>
      <Hero />
      <SocialProofSection />
      <HowItWorksSection />
      {/* <WhoIsItForSection /> */}
      <FAQSection />
      {!userId && <CTASection />}
    </>
  );
}
