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
    <div className="flex flex-col relative">
      <ClerkProvider dynamic>
        {!isRecruitmentPage && <Header className="sticky top-0 z-[100]" />}
      </ClerkProvider>

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
