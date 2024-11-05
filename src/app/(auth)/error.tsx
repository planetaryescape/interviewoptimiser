"use client";

import { Button } from "@/components/ui/button";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "auth");
      scope.setExtra("message", error.message);
      Sentry.captureException(error);
    });
  }, [error]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl animate-pulse" />
          <AlertTriangle className="relative w-16 h-16 text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Authentication Error
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            We encountered an issue during the authentication process. Please
            try again.
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
            <Link href="/sign-in">Go to Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
