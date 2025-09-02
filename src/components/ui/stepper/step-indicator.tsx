"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface StepConfig {
  number: number;
  label: string;
}

interface StepIndicatorProps {
  steps: StepConfig[];
  currentStep: number;
  canProceedToNextStep: boolean;
  animateStep: number | null;
  onStepClick?: (stepNumber: number) => void;
}

/**
 * A reusable step indicator component that shows the current step in a multi-step process
 */
export function StepIndicator({
  steps,
  currentStep,
  canProceedToNextStep,
  animateStep,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="relative flex items-center justify-center gap-3 xs:gap-5 sm:gap-6 md:gap-10 lg:gap-16 px-2">
        {/* Connector Lines - Positioned behind the circles */}
        <div className="absolute top-4 xs:top-5 left-[18px] right-[18px] xs:left-[22px] xs:right-[22px] h-1 bg-border z-0">
          {/* Dynamic connector lines based on steps */}
          {steps.slice(0, -1).map((_, index) => {
            const lineIndex = index + 1;
            const isActive = currentStep > lineIndex;
            return (
              <div
                key={`line-${lineIndex}`}
                className={cn(
                  "absolute h-full transition-all duration-500 ease-in-out",
                  isActive ? "bg-primary" : "bg-transparent",
                  index === 0 ? "left-0 w-1/2" : "right-0 w-1/2"
                )}
              />
            );
          })}
        </div>

        {/* Step Circles */}
        {steps.map((stepItem) => (
          <div
            key={stepItem.number}
            className={cn(
              "flex flex-col items-center relative z-10 transition-all duration-300",
              stepItem.number <= currentStep ? "text-primary" : "text-muted-foreground"
            )}
          >
            {/* Circle */}
            <button
              type="button"
              onClick={() => onStepClick?.(stepItem.number)}
              disabled={!onStepClick}
              className={cn(
                "w-8 h-8 xs:w-10 xs:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                stepItem.number < currentStep
                  ? "bg-primary border-primary text-primary-foreground"
                  : stepItem.number === currentStep
                    ? "bg-background border-primary text-primary"
                    : "bg-background border-muted-foreground text-muted-foreground",
                stepItem.number === animateStep && "animate-pulse",
                onStepClick && "cursor-pointer"
              )}
              aria-label={`Go to step ${stepItem.number}: ${stepItem.label}`}
            >
              {stepItem.number < currentStep ? (
                <Check className="h-4 w-4 xs:h-5 xs:w-5" />
              ) : (
                <span className="text-sm xs:text-base font-medium">{stepItem.number}</span>
              )}
            </button>

            {/* Label */}
            <span className="mt-2 text-xs xs:text-sm font-medium whitespace-nowrap">
              {stepItem.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
