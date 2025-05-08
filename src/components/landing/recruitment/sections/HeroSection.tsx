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
    <SectionWrapper className="min-h-[90vh] flex items-center py-24 md:py-32 overflow-hidden relative">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.1),transparent_50%)]" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left side - Copy */}
        <HeroCopy onOpenDemoModal={handleOpenDemoModal} />

        {/* Right side - Visual */}
        <HeroVisual />
      </div>

      {/* Badge Row */}
      <HeroBadgeRow />

      {/* Demo Modal */}
      <HeroDemoModal isOpen={isDemoModalOpen} onClose={handleCloseDemoModal} />
    </SectionWrapper>
  );
}
