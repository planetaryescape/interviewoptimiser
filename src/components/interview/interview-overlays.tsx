"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import type { InterviewState } from "~/lib/hooks/use-interview-state";

interface InterviewOverlaysProps {
  state: InterviewState;
  isComplete: boolean;
  error?: string;
  canRetry: boolean;
  onRetry?: () => void;
  disconnectInitiator?: "user" | "ai";
}

export function InterviewOverlays({
  state,
  isComplete,
  error,
  canRetry,
  onRetry,
  disconnectInitiator,
}: InterviewOverlaysProps) {
  // Connecting state
  if (state === "connecting") {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Connecting to Interview
            </CardTitle>
            <CardDescription>Setting up your interview session...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Completing state
  if (state === "user_completing" || state === "ai_completing") {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Completing Interview
            </CardTitle>
            <CardDescription>
              {disconnectInitiator === "ai"
                ? "The AI interviewer is wrapping up..."
                : "Saving your interview and generating report..."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Completed state
  if (isComplete || state === "completed") {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Interview Complete
            </CardTitle>
            <CardDescription>
              Your interview has been saved. Generating your performance report...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Error state
  if (state === "error" && error) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Connection Error
            </CardTitle>
            <CardDescription className="text-destructive/80">{error}</CardDescription>
          </CardHeader>
          {canRetry && onRetry && (
            <CardContent>
              <Button onClick={onRetry} variant="outline" className="w-full">
                Retry Connection
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  return null;
}
