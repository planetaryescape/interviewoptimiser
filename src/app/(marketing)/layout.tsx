"use client";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { RecruitmentBanner } from "@/components/landing/recruitment-banner";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useFeatureFlagEnabled } from "posthog-js/react";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

export default function LandingPage({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const pathname = usePathname();
  const recruitmentFlagEnabled = useFeatureFlagEnabled("recruitment-platform");

  // Hide main header and footer on the recruitment landing page
  const isRecruitmentPage = pathname === "/recruitment";
  // Only show the recruitment banner on the main landing page when the feature flag is enabled
  const isMainLandingPage = pathname === "/";
  const showRecruitmentBanner = isMainLandingPage && recruitmentFlagEnabled;

  return (
    <div className="flex flex-col relative min-h-screen">
      {showRecruitmentBanner && <RecruitmentBanner />}
      {!isRecruitmentPage && <Header />}

      <main className="flex-grow">{children}</main>

      {!isRecruitmentPage && <Footer />}

      <Toaster
        position="top-center"
        richColors={true}
        duration={10000}
        theme={theme as "light" | "dark" | "system" | undefined}
        toastOptions={{
          duration: 10000,
        }}
      />
    </div>
  );
}
