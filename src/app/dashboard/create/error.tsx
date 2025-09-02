"use client";

import { AlertCircle, Home, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter();

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg border border-border overflow-hidden">
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/15 flex items-center justify-center mb-5">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>

          <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">
            We encountered an error while trying to create your job. Please try again.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button variant="default" className="flex items-center gap-2 flex-1" onClick={reset}>
              <RefreshCcw className="h-4 w-4" />
              Try again
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-2 flex-1"
              onClick={handleGoToDashboard}
            >
              <Home className="h-4 w-4" />
              Go to dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
