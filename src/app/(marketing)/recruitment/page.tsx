import SchemaMarkup from "@/components/landing/recruitment/SchemaMarkup";
import B2BTestimonialsSection from "@/components/landing/recruitment/sections/B2BTestimonialsSection";
import CandidatePracticeZone from "@/components/landing/recruitment/sections/CandidatePracticeZone";
import ContactFormSection from "@/components/landing/recruitment/sections/ContactFormSection";
import EnterpriseTrustSection from "@/components/landing/recruitment/sections/EnterpriseTrustSection";
import FAQSection from "@/components/landing/recruitment/sections/FAQSection";
import FeatureSpotlightCarousel from "@/components/landing/recruitment/sections/FeatureSpotlightCarousel";
import HeroSection from "@/components/landing/recruitment/sections/HeroSection";
import HowItWorksSection from "@/components/landing/recruitment/sections/HowItWorksSection";
import PricingPreviewSection from "@/components/landing/recruitment/sections/PricingPreviewSection";
import ProblemSolutionSection from "@/components/landing/recruitment/sections/ProblemSolutionSection";
import RecruiterROIBand from "@/components/landing/recruitment/sections/RecruiterROIBand";
import SocialProofBar from "@/components/landing/recruitment/sections/SocialProofBar";
import { Suspense } from "react";

export default function RecruitmentPage() {
  return (
    <>
      <SchemaMarkup />

      <Suspense fallback={null}>
        <HeroSection />
      </Suspense>
      <SocialProofBar />
      <ProblemSolutionSection />
      <FeatureSpotlightCarousel />
      <HowItWorksSection />
      <RecruiterROIBand />
      <EnterpriseTrustSection />
      <B2BTestimonialsSection />
      <CandidatePracticeZone />
      <PricingPreviewSection />
      <FAQSection />
      <ContactFormSection />
    </>
  );
}
