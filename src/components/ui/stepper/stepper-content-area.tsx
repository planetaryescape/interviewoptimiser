"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { ChevronLeft, ChevronRight, Home, Layout } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import useMeasure from "react-use-measure";
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

const BLOBS = [
  { id: "blob-1", position: { top: "10%", left: "10%" } },
  { id: "blob-2", position: { top: "30%", left: "80%" } },
  { id: "blob-3", position: { top: "70%", left: "20%" } },
  { id: "blob-4", position: { top: "85%", left: "70%" } },
];

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
  const controls = useAnimationControls();
  const [measureRef, { height: measuredHeight }] = useMeasure();
  const [_isAnimating, setIsAnimating] = useState(false);

  // Animate height changes - using Interview's superior physics
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
      // Fallback to 'auto' if height is 0, useful for initial render or empty steps
      controls.start({
        height: "auto",
        transition: { duration: 0 },
      });
    }
  }, [measuredHeight, controls]);

  // Define animation variants for slide - using Interview's superior zIndex approach
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      zIndex: 1,
    }),
    center: {
      x: 0,
      zIndex: 2,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? "-100%" : "100%",
      zIndex: 1,
    }),
  };

  // Interview's superior spring physics - smoother, more natural movement
  const transition = {
    type: "spring" as const,
    stiffness: 150,
    damping: 18,
    mass: 1.1,
  };

  const isLastStep = currentStep === steps.length;

  return (
    <div className="relative flex-1 flex flex-col items-center justify-start w-full px-4 md:px-6 lg:px-8 py-8 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        {BLOBS.map((blob) => (
          <motion.div
            key={blob.id}
            className="absolute rounded-full bg-primary/5 blur-3xl"
            style={{
              ...blob.position,
              width: "40%",
              height: "40%",
              transform: "translate(-50%, -50%)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main content box */}
      <div className="relative bg-card/95 backdrop-blur-md rounded-xl shadow-xl border border-border/40 overflow-hidden w-full max-w-7xl animate-in fade-in slide-in-from-bottom-8 duration-500 z-10">
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
          className="relative overflow-hidden w-full"
          animate={controls}
          initial={{ height: "auto" }}
        >
          <AnimatePresence initial={false} mode="sync" custom={animationDir}>
            <motion.div
              key={currentStep}
              custom={animationDir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="absolute w-full"
              onAnimationStart={() => setIsAnimating(true)}
              onAnimationComplete={() => setIsAnimating(false)}
            >
              <div ref={measureRef}>{stepContent[currentStep]}</div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation Buttons */}
      {showBottomNavigation && (
        <div className="relative mt-6 pt-6 border-t border-border/40 flex flex-wrap gap-4 justify-center w-full max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 z-10">
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
