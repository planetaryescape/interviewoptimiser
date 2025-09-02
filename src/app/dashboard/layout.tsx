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
  const isInterviewPage = /^\/dashboard\/jobs\/[^/]+\/interviews/.test(pathname);
  const showSidebar = !isCreateJob && !isInterviewPage;
  const showHeader = !isCreateJob && !isInterviewPage;

  return (
    <div
      className={cn(
        "grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] flex-col w-full min-h-screen max-h-screen h-screen bg-background"
      )}
    >
      {showHeader && (
        <ClerkProvider dynamic>
          <div className="row-span-1 col-span-2 z-[9999]">
            <DashboardHeader />
          </div>
        </ClerkProvider>
      )}

      {showSidebar && (
        <DashboardSidebar className={cn("col-span-1", showHeader ? "row-span-1" : "row-span-2")} />
      )}

      <main
        className={cn(
          "col-span-1 flex-1 overflow-auto bg-background text-foreground",
          showHeader ? "row-span-1" : "row-span-2",
          showSidebar ? "col-span-1" : "col-span-2"
        )}
      >
        {children}
      </main>

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
