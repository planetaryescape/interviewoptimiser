"use client";

import { Header } from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { ReactNode } from "react";
import { Toaster } from "sonner";

export default function LandingPage({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  return (
    <div className="max-h-screen min-h-screen grid grid-rows-[auto_1fr] overflow-hidden">
      <ClerkProvider dynamic>
        <Header className="row-span-1" />
      </ClerkProvider>

      <main className="text-muted-foreground row-span-1 overflow-hidden">
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
