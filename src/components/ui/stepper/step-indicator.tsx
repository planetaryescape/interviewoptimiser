"use client";

import { cn } from "@/lib/utils";
import { Check, type LucideIcon } from "lucide-react";

export interface StepConfig {
  number: number;
  label: string;
  icon?: LucideIcon;
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
    <div className="flex items-center justify-center py-2">
      <div className="relative flex items-center gap-3 xs:gap-5 sm:gap-6 md:gap-10 lg:gap-16 px-2">
        {/* Connector Lines - Positioned to go through the center of circles */}
        <div
          className="absolute left-[20px] right-[20px] xs:left-[24px] xs:right-[24px] h-0.5 bg-gradient-to-r from-border via-border to-border z-0"
          style={{ top: "calc(20px + 1px)" }}
        >
          {/* Progress bar - dynamically calculated based on current step */}
          <div
            className="absolute h-full left-0 bg-gradient-to-r from-primary to-primary/80 transition-all duration-700 ease-out rounded-full"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              boxShadow: currentStep > 1 ? "0 0 12px rgba(var(--primary), 0.3)" : "none",
            }}
          />
        </div>

        {/* Step Circles */}
        {steps.map((stepItem) => {
          const Icon = stepItem.icon;
          const isActive = currentStep === stepItem.number;
          const isCompleted = stepItem.number < currentStep;
          const isClickable = stepItem.number < currentStep && onStepClick;

          return (
            <div
              key={stepItem.number}
              className={cn(
                "flex flex-col items-center relative z-10 transition-all duration-300",
                isActive || isCompleted ? "text-primary" : "text-muted-foreground"
              )}
            >
              <button
                type="button"
                onClick={() => isClickable && onStepClick(stepItem.number)}
                disabled={!isClickable}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Go to step ${stepItem.number}: ${stepItem.label}`}
                className={cn(
                  "w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 relative group",
                  stepItem.number === animateStep && "animate-pulse",
                  isActive
                    ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground ring-4 ring-primary/20 shadow-lg hover:shadow-xl"
                    : isCompleted
                      ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg cursor-pointer hover:scale-105 active:scale-95"
                      : "bg-background border-2 border-border text-muted-foreground cursor-default hover:border-primary/30"
                )}
              >
                {/* Pulse animation for active step */}
                {isActive && (
                  <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30" />
                )}

                {/* Step content */}
                <span className="relative flex items-center justify-center">
                  {isCompleted ? (
                    <Check className="h-5 w-5 xs:h-6 xs:w-6" strokeWidth={2.5} />
                  ) : isActive && Icon ? (
                    <Icon className="h-5 w-5 xs:h-6 xs:w-6" strokeWidth={2} />
                  ) : (
                    <span className="text-sm font-semibold">{stepItem.number}</span>
                  )}
                </span>
              </button>

              {/* Step label */}
              <span
                className={cn(
                  "text-[10px] xs:text-xs mt-2 xs:mt-2.5 font-medium text-center max-w-[60px] xs:max-w-none transition-all duration-300",
                  isActive
                    ? "text-foreground font-semibold"
                    : isCompleted
                      ? "text-primary"
                      : "text-muted-foreground"
                )}
              >
                {stepItem.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
