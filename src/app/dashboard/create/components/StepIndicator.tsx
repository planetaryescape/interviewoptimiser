"use client";

import { cn } from "@/lib/utils";
import { useCreateJobActions, useCreateJobStep } from "@/stores/createJobStore";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  canProceedToNextStep: boolean;
  animateStep: number | null;
}

export function StepIndicator({ canProceedToNextStep, animateStep }: StepIndicatorProps) {
  const step = useCreateJobStep();
  const { setStep } = useCreateJobActions();

  // Steps configuration
  const steps = [
    { number: 1, label: "Job Details" },
    { number: 2, label: "CV" },
    { number: 3, label: "Settings" },
  ];

  return (
    <div className="flex items-center justify-center">
      <div className="relative flex items-center justify-center gap-5 xs:gap-6 md:gap-12 lg:gap-16 px-2">
        {/* Connector Lines - Positioned behind the circles */}
        <div className="absolute top-5 left-[22px] right-[22px] h-1 bg-border z-0">
          {/* First half of the line - colored if step > 1 */}
          <div
            className={cn(
              "absolute h-full left-0 w-1/2 transition-all duration-500 ease-in-out",
              step > 1 ? "bg-primary" : "bg-transparent"
            )}
          />
          {/* Second half of the line - colored if step > 2 */}
          <div
            className={cn(
              "absolute h-full right-0 w-1/2 transition-all duration-500 ease-in-out",
              step > 2 ? "bg-primary" : "bg-transparent"
            )}
          />
        </div>

        {/* Step Circles */}
        {steps.map((stepItem) => (
          <div
            key={stepItem.number}
            className={cn(
              "flex flex-col items-center relative z-10 transition-all duration-300",
              stepItem.number <= step ? "text-primary" : "text-muted-foreground"
            )}
          >
            <button
              type="button"
              onClick={() => stepItem.number < step && setStep(stepItem.number)}
              disabled={stepItem.number >= step}
              aria-current={step === stepItem.number ? "step" : undefined}
              aria-label={`Go to step ${stepItem.number}: ${stepItem.label}`}
              className={cn(
                "w-9 h-9 xs:w-10 xs:h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 shadow",
                animateStep === stepItem.number && "animate-step-complete",
                step === stepItem.number
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background shadow-md scale-110"
                  : stepItem.number < step
                    ? "bg-primary text-primary-foreground border-none hover:ring-2 hover:ring-primary/20 hover:ring-offset-2 hover:ring-offset-background cursor-pointer"
                    : "bg-muted text-muted-foreground border border-border cursor-default"
              )}
            >
              {stepItem.number < step ? <Check className="h-5 w-5" /> : stepItem.number}
            </button>
            <span
              className={cn(
                "text-xs mt-2 font-medium text-center",
                step === stepItem.number
                  ? "text-foreground"
                  : stepItem.number < step
                    ? "text-primary"
                    : "text-muted-foreground"
              )}
            >
              {stepItem.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
