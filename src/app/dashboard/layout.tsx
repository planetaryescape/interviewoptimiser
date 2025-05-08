"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { ClerkProvider } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col relative min-h-screen">
      <ClerkProvider dynamic>
        <div className="fixed top-0 left-0 right-0 z-[9999]">
          <DashboardHeader />
        </div>
      </ClerkProvider>

      <main className="flex-grow pt-16 overflow-auto">{children}</main>

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
