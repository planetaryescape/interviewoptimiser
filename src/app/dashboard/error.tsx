"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <AlertTriangle className="w-16 h-16 mb-4 text-red-500 animate-pulse" />
      <h1 className="text-3xl font-bold mb-2">Dashboard Error</h1>
      <p className="text-xl mb-6 text-center max-w-md">
        We encountered an issue while loading your dashboard. We&apos;re sorry
        for the inconvenience.
      </p>
      <div className="flex space-x-4">
        <Button
          onClick={reset}
          size="lg"
          className="bg-primary hover:bg-primary/90"
        >
          Try Again
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href="/dashboard">Go to Dashboard Home</a>
        </Button>
      </div>
      <p className="mt-8 text-sm text-muted-foreground text-center max-w-md">
        If you continue to experience issues, please{" "}
        <a
          href="mailto:cvoptimiser@bhekani.com"
          className="text-primary hover:underline"
        >
          contact our support team
        </a>
        .
      </p>
    </div>
  );
}
