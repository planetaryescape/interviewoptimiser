"use client";

import { Button } from "@/components/ui/button";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "dashboard");
      scope.setExtra("message", error.message);
      Sentry.captureException(error);
    });
  }, [error]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
      <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl animate-pulse" />
          <AlertTriangle className="relative w-16 h-16 text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Dashboard Error
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            We encountered an issue while loading your dashboard. We&apos;re sorry for the
            inconvenience.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={reset}
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
          >
            Try Again
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard">Go to Dashboard Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
