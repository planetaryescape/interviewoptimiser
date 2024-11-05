"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { ClerkProvider } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.withScope((scope) => {
      scope.setExtra("message", error.message);
      scope.setExtra("digest", error.digest);
      Sentry.captureException(error);
    });
  }, [error]);

  return (
    <html>
      <body>
        <div className="relative min-h-screen bg-background text-foreground">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
          <ClerkProvider dynamic>
            <Header />
          </ClerkProvider>
          <main className="relative container flex-grow flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full max-w-md bg-background/10 backdrop-blur-lg rounded-lg" />
            </div>
            <div className="relative space-y-6 text-center">
              <AlertTriangle className="w-16 h-16 mx-auto text-red-500 animate-pulse" />
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
                  Something went wrong!
                </h1>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  We apologize for the inconvenience. An unexpected error
                  occurred.
                </p>
              </div>
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={reset}
                  size="lg"
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                >
                  Try Again
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/">Go to Homepage</Link>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
