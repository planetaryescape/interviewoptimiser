"use client";

import { useState } from "react";
import HeroBadgeRow from "../hero/HeroBadgeRow";
import HeroCopy from "../hero/HeroCopy";
import HeroDemoModal from "../hero/HeroDemoModal";
import HeroVisual from "../hero/HeroVisual";
import SectionWrapper from "../ui/SectionWrapper";

export default function HeroSection() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const handleOpenDemoModal = () => setIsDemoModalOpen(true);
  const handleCloseDemoModal = () => setIsDemoModalOpen(false);

  return (
    <SectionWrapper className="min-h-[90vh] flex flex-col justify-center py-16 md:py-24 overflow-hidden relative">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_70%)]" />

      <div className="flex flex-col items-center text-center max-w-8xl mx-auto px-4 md:px-6">
        {/* Main Content Area - Vertically Stacked */}
        <div className="space-y-10 w-full">
          {/* Copy Section - Centralized */}
          <div className="space-y-6">
            <HeroCopy onOpenDemoModal={handleOpenDemoModal} centerAligned={true} />
          </div>

          {/* Visual Section - Below Copy */}
          <div className="mt-12 w-full mx-auto">
            <HeroVisual />
          </div>

          {/* Badge Row - At Bottom */}
          <div className="mt-10 pt-8 border-t border-border/30 w-full">
            <HeroBadgeRow centerAligned={true} />
          </div>
        </div>
      </div>

      {/* Demo Modal */}
      <HeroDemoModal isOpen={isDemoModalOpen} onClose={handleCloseDemoModal} />
    </SectionWrapper>
  );
}
