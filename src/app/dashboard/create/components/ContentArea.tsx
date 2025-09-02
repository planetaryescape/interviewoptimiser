"use client";

import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { ChevronLeft, ChevronRight, Home, Layout } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import useMeasure from "react-use-measure";
import { Step1JobDescription } from "@/components/create-optimization/Step1JobDescription";
import { Step2CV } from "@/components/create-optimization/Step2CV";
import { Step3AdditionalInfo } from "@/components/create-optimization/Step3AdditionalInfo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCreateJobStep } from "@/stores/createJobStore";
import { StepIndicator } from "./StepIndicator";

interface ContentAreaProps {
  animationDir: number;
  canProceedToNextStep: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  animateStep: number | null;
}

export function ContentArea({
  animationDir,
  canProceedToNextStep,
  isSubmitting,
  onBack,
  onNext,
  onSubmit,
  animateStep,
}: ContentAreaProps) {
  const step = useCreateJobStep();
  const router = useRouter();
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const [measureRef, { height: measuredHeight }] = useMeasure();

  // Content mapping
  const stepContent = {
    1: <Step1JobDescription />,
    2: <Step2CV />,
    3: <Step3AdditionalInfo />,
  };

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
          stiffness: 300, // Increased stiffness for a slightly quicker response
          damping: 30, // Adjusted damping to match
        },
      });
    } else {
      // Fallback to 'auto' if height is 0, useful for initial render or empty steps
      // This might happen briefly if the exiting element is measured before the entering one with mode='sync'
      // However, with key={step} on the inner motion.div, measureRef should be on the new entering element.
      controls.start({
        height: "auto",
        transition: { duration: 0 }, // No animation for 'auto' if measuredHeight is not yet available
      });
    }
  }, [measuredHeight, controls]);

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

        {/* Content area */}
        <motion.div
          ref={contentWrapperRef}
          className="relative overflow-hidden"
          initial={{ height: "auto" }}
          animate={controls}
        >
          <AnimatePresence initial={false} custom={animationDir} mode="sync">
            <motion.div
              key={step}
              custom={animationDir}
              variants={slideVariants}
              initial="enter"
              animate="visible"
              exit="exit"
              transition={transition}
              className="w-full absolute top-0 left-0 right-0"
              ref={measureRef}
            >
              {stepContent[step as keyof typeof stepContent]}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation Buttons */}
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
    </div>
  );
}
