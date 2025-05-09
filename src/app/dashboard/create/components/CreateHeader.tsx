"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCreateInterviewStep } from "@/stores/createInterviewStore";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StepIndicator } from "./StepIndicator";

interface CreateHeaderProps {
  canProceedToNextStep: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  animateStep: number | null;
}

export function CreateHeader({
  canProceedToNextStep,
  isSubmitting,
  onBack,
  onNext,
  onSubmit,
  animateStep,
}: CreateHeaderProps) {
  const step = useCreateInterviewStep();

  return (
    <header className="fixed top-0 z-50 w-full bg-background/70 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto w-full px-3 md:px-6 py-4 md:py-5">
        <div className="flex items-center justify-between">
          {/* Back Button */}
          <div className="w-20 md:w-24">
            <Button
              variant="outline"
              size="sm"
              disabled={step === 1}
              onClick={onBack}
              className={cn(
                "flex items-center gap-1 text-muted-foreground hover:text-foreground",
                step === 1 && "opacity-50 pointer-events-none"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden xs:inline">Back</span>
            </Button>
          </div>

          {/* Step Indicator */}
          <StepIndicator canProceedToNextStep={canProceedToNextStep} animateStep={animateStep} />

          {/* Next/Submit Button */}
          <div className="w-20 md:w-24 flex justify-end">
            <Button
              size="sm"
              disabled={isSubmitting || !canProceedToNextStep}
              onClick={() => {
                if (step !== 3) {
                  onNext();
                } else {
                  onSubmit();
                }
              }}
              className="flex items-center gap-1"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : step === 3 ? (
                "Submit"
              ) : (
                <>
                  <span className="hidden xs:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
