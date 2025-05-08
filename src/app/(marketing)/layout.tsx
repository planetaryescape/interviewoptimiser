"use client";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

export default function LandingPage({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const pathname = usePathname();

  // Hide main header and footer on the recruitment landing page
  const isRecruitmentPage = pathname === "/recruitment";

  return (
    <div className="flex flex-col relative min-h-screen">
      <ClerkProvider dynamic>
        {!isRecruitmentPage && (
          <div className="fixed top-0 left-0 right-0 z-[9999]">
            <Header />
          </div>
        )}
      </ClerkProvider>

      <main className={`flex-grow ${!isRecruitmentPage ? "pt-16" : ""}`}>{children}</main>

      {!isRecruitmentPage && (
        <div className="mt-auto">
          <Footer />
        </div>
      )}

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
