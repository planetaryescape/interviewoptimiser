"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { ClerkProvider } from "@clerk/nextjs";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
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
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <ClerkProvider dynamic>
        <Header />
      </ClerkProvider>
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-16 h-16 mb-4 text-red-500 animate-pulse" />
        <h1 className="text-3xl font-bold mb-2">Oops! Something went wrong</h1>
        <p className="text-xl mb-6 text-center max-w-md">
          We apologize for the inconvenience. An unexpected error occurred while
          processing your request.
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
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
        <p className="mt-8 text-sm text-muted-foreground text-center max-w-md">
          If the problem persists, please{" "}
          <a
            href="mailto:cvoptimiser@bhekani.com"
            className="text-primary hover:underline"
          >
            contact our support team
          </a>
          .
        </p>
      </main>
    </div>
  );
}
