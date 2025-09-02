"use client";

import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { ChevronLeft, ChevronRight, Home, Layout } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import useMeasure from "react-use-measure";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StepConfig } from "./step-indicator";
import { StepIndicator } from "./step-indicator";

interface StepperContentAreaProps {
  steps: StepConfig[];
  currentStep: number;
  stepContent: Record<number, ReactNode>;
  animationDir: number;
  canProceedToNextStep: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  animateStep: number | null;
  onStepClick?: (stepNumber: number) => void;
  showBottomNavigation?: boolean;
}

/**
 * A reusable stepper content area component that handles step transitions with animations
 */
export function StepperContentArea({
  steps,
  currentStep,
  stepContent,
  animationDir,
  canProceedToNextStep,
  isSubmitting,
  onBack,
  onNext,
  onSubmit,
  animateStep,
  onStepClick,
  showBottomNavigation = true,
}: StepperContentAreaProps) {
  const router = useRouter();
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const [measureRef, { height: measuredHeight }] = useMeasure();

  // Define animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      zIndex: 1,
    }),
    visible: {
      x: 0,
      zIndex: 2,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? "-100%" : "100%",
      zIndex: 1,
    }),
  };

  const transition = {
    type: "spring" as const,
    stiffness: 150,
    damping: 18,
    mass: 1.1,
  };

  // Effect to animate contentWrapperRef's height when measuredHeight of the current step's content changes
  useEffect(() => {
    if (measuredHeight > 0) {
      controls.start({
        height: measuredHeight,
        transition: {
          type: "spring" as const,
          stiffness: 300,
          damping: 30,
        },
      });
    } else {
      controls.start({
        height: "auto",
        transition: { duration: 0 },
      });
    }
  }, [measuredHeight, controls]);

  const isLastStep = currentStep === steps.length;

  return (
    <div className="flex-1 flex flex-col items-center w-full px-4 md:px-6 lg:px-8 py-8 md:py-16 justify-start md:justify-start">
      {/* Main content box */}
      <div className="bg-card/95 backdrop-blur-md rounded-xl shadow-xl border border-border/40 overflow-hidden w-full max-w-7xl animate-in fade-in slide-in-from-bottom-8 duration-500">
        {/* Step navigation header */}
        <div className="w-full px-2 xs:px-3 md:px-6 py-3 xs:py-4 md:py-5 border-b border-border/40">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <div className="w-20 md:w-24">
              <Button
                variant="outline"
                size="sm"
                disabled={currentStep === 1}
                onClick={onBack}
                className={cn(
                  "flex items-center gap-1 text-muted-foreground hover:text-foreground",
                  currentStep === 1 && "opacity-50 pointer-events-none"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden xs:inline">Back</span>
              </Button>
            </div>

            {/* Step Indicator */}
            <StepIndicator
              steps={steps}
              currentStep={currentStep}
              canProceedToNextStep={canProceedToNextStep}
              animateStep={animateStep}
              onStepClick={onStepClick}
            />

            {/* Next/Submit Button */}
            <div className="w-20 md:w-24 flex justify-end">
              <Button
                size="sm"
                disabled={isSubmitting || !canProceedToNextStep}
                onClick={() => {
                  if (!isLastStep) {
                    onNext();
                  } else {
                    onSubmit();
                  }
                }}
                className="flex items-center gap-1"
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : isLastStep ? (
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

        {/* Content area */}
        <motion.div
          ref={contentWrapperRef}
          className="relative overflow-hidden"
          initial={{ height: "auto" }}
          animate={controls}
        >
          <AnimatePresence initial={false} custom={animationDir} mode="sync">
            <motion.div
              key={currentStep}
              custom={animationDir}
              variants={slideVariants}
              initial="enter"
              animate="visible"
              exit="exit"
              transition={transition}
              className="w-full absolute top-0 left-0 right-0"
              ref={measureRef}
            >
              {stepContent[currentStep]}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation Buttons */}
      {showBottomNavigation && (
        <div className="mt-6 pt-6 border-t border-border/40 flex flex-wrap gap-4 justify-center w-full max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/")}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2"
          >
            <Layout className="h-4 w-4" />
            Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}
