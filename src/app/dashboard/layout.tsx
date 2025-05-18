"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const pathname = usePathname();
  const isCreateJob = pathname.includes("/dashboard/create");
  const isInterviewPage = /^\/dashboard\/jobs\/[^\/]+\/interviews/.test(pathname);
  const showSidebar = !isCreateJob && !isInterviewPage;
  const showHeader = !isCreateJob && !isInterviewPage;

  return (
    <div className="flex flex-col w-full min-h-screen bg-background">
      {showHeader && (
        <ClerkProvider dynamic>
          <div className="fixed top-0 left-0 right-0 z-[9999]">
            <DashboardHeader />
          </div>
        </ClerkProvider>
      )}

      <div className={cn("flex flex-1", showHeader && "pt-16")}>
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
