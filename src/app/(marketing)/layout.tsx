"use client";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { useTheme } from "next-themes";
import { ReactNode } from "react";
import { Toaster } from "sonner";

export default function LandingPage({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <div className="max-h-svh h-svh flex flex-col relative">
      <Header className="sticky top-0 z-[100]" />

      <main className="flex-grow">{children}</main>

      <Footer />

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
