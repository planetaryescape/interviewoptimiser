"use client";

import { BackgroundGradient } from "@/components/background-gradient";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

interface CreateJobLayoutProps {
  children: React.ReactNode;
}

export default function CreateJobLayout({ children }: CreateJobLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      {/* Gradient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Primary gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background" />

        {/* Decorative gradient elements */}
        <div className="absolute -right-32 top-1/3 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-primary/20 to-secondary/10 blur-3xl opacity-60 animate-float" />
        <div
          className="absolute -left-20 bottom-1/4 w-72 h-72 rounded-full bg-gradient-to-tr from-secondary/20 to-primary/5 blur-2xl opacity-50 animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-20 right-1/4 w-64 h-64 rounded-full bg-gradient-to-tl from-primary-foreground/10 to-secondary/10 blur-xl opacity-40 animate-float"
          style={{ animationDelay: "2s" }}
        />

        {/* Additional subtle elements */}
        <div
          className="absolute bottom-40 right-1/3 w-48 h-48 rounded-full bg-gradient-to-tr from-primary/10 to-background blur-2xl opacity-30 animate-float"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute top-1/2 left-1/4 w-56 h-56 rounded-full bg-gradient-to-bl from-secondary/15 to-background blur-3xl opacity-25 animate-float"
          style={{ animationDelay: "0.5s" }}
        />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-5" />
      </div>

      {/* Theme toggle button - hidden on mobile */}
      <div className="fixed top-4 right-4 z-[60] hidden sm:block">
        <div className="bg-background/40 backdrop-blur-md p-2 rounded-full border border-border/30 shadow-sm">
          <ThemeToggle />
        </div>
      </div>

      {/* Main content */}
      <main className={cn("flex-1 flex flex-col relative z-10")}>{children}</main>

      <BackgroundGradient degrees={212} />
    </div>
  );
}
