"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { ClerkProvider } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const pathname = usePathname();
  const showSidebar = !pathname.includes("/dashboard/create");

  return (
    <div className="flex flex-col w-full min-h-screen bg-background">
      <ClerkProvider dynamic>
        <div className="fixed top-0 left-0 right-0 z-[9999]">
          <DashboardHeader />
        </div>
      </ClerkProvider>

      <div className="flex flex-1 pt-16">
        {showSidebar && <DashboardSidebar />}

        <main className="flex-1 overflow-auto bg-background text-foreground">{children}</main>
      </div>

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
