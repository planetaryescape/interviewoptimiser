"use client";

import { BackgroundGradient as AnotherBackgroundGradient } from "@/components/background-gradient";
import { ConfirmationModal } from "@/components/create-optimization/ConfirmationModal";
import { CreateInterviewErrorModal } from "@/components/create-optimization/CreateInterviewErrorModal";
import { OutOfMinutesModal } from "@/components/create-optimization/OutOfMinutesModal";
import { ProcessingTakeover } from "@/components/create-optimization/ProcessingTakeover";
import { Step1CV } from "@/components/create-optimization/Step1CV";
import { Step2JobDescription } from "@/components/create-optimization/Step2JobDescription";
import { Step3AdditionalInfo } from "@/components/create-optimization/Step3AdditionalInfo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { getRepository } from "@/lib/data/repositoryFactory";
import { sanitiseUserInputText } from "@/lib/sanitiseUserInputText";
import { cn } from "@/lib/utils";
import { idHandler } from "@/lib/utils/idHandler";
import {
  useCreateInterviewActions,
  useCreateInterviewAdditionalInfo,
  useCreateInterviewCVText,
  useCreateInterviewDuration,
  useCreateInterviewInterviewType,
  useCreateInterviewIsAlertDialogOpen,
  useCreateInterviewIsOutOfMinutesDialogOpen,
  useCreateInterviewIsScheduleErrorDialogOpen,
  useCreateInterviewJobDescriptionText,
  useCreateInterviewShowTakeover,
  useCreateInterviewStep,
} from "@/stores/createInterviewStore";
import * as Sentry from "@sentry/nextjs";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Home, Layout } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { config } from "~/config";
import type { NewInterview } from "~/db/schema";

export default function CreateInterview() {
  const step = useCreateInterviewStep();
  const cvText = useCreateInterviewCVText();
  const jobDescriptionText = useCreateInterviewJobDescriptionText();
  const additionalInfo = useCreateInterviewAdditionalInfo();
  const showTakeover = useCreateInterviewShowTakeover();
  const isAlertDialogOpen = useCreateInterviewIsAlertDialogOpen();
  const isOutOfMinutesDialogOpen = useCreateInterviewIsOutOfMinutesDialogOpen();
  const isScheduleErrorDialogOpen = useCreateInterviewIsScheduleErrorDialogOpen();
  const {
    setStep,
    setShowTakeover,
    setIsAlertDialogOpen,
    setIsOutOfMinutesDialogOpen,
    setIsScheduleErrorDialogOpen,
    resetStore,
  } = useCreateInterviewActions();
  const duration = useCreateInterviewDuration();
  const interviewType = useCreateInterviewInterviewType();

  const [animateStep, setAnimateStep] = useState<number | null>(null);

  useEffect(() => {
    if (animateStep !== null) {
      const timer = setTimeout(() => {
        setAnimateStep(null);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [animateStep]);

  const router = useRouter();
  const posthog = usePostHog();
  const { data: user } = useUser();

  const canProceedToStep2 = cvText?.trim().length > 0;
  const canProceedToStep3 = jobDescriptionText?.trim().length > 0;

  const handleNextStep = (currentStep: number) => {
    if (currentStep === 1 && canProceedToStep2) {
      setAnimateStep(1);
      setStep(2);
    } else if (currentStep === 2 && canProceedToStep3) {
      setAnimateStep(2);
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(Math.max(1, step - 1));
  };

  const createInterviewMutation = useMutation({
    mutationFn: async (interview: NewInterview) => {
      const interviewRepository = await getRepository<NewInterview>("interviews", true);
      const createdInterview = await interviewRepository.create(interview);

      // Extract structured data
      await fetch("/api/interviews/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvText: interview.submittedCVText,
          jobDescriptionText: interview.jobDescriptionText,
          interviewId: createdInterview.sys.id,
          interviewType: interview.type,
        }),
      });

      return createdInterview;
    },
    onSuccess: (data) => {
      toast.success("Interview created successfully");
      setShowTakeover(true);
      setTimeout(() => {
        resetStore();
        router.push(`/dashboard/interviews/${idHandler.encode(data.sys.id ?? 0)}`);
        setShowTakeover(false);
      }, 9000);
    },
    onError: (error) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "createOptimizationMutation");
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });
      setIsScheduleErrorDialogOpen(true);
    },
  });

  const handleSubmit = async () => {
    if (!user || user.minutes <= 0 || user.minutes < duration) {
      posthog.capture("out_of_minutes", {
        userId: user?.id,
      });
      setIsOutOfMinutesDialogOpen(true);
    } else {
      setIsAlertDialogOpen(true);
    }
  };

  const handleConfirmSubmit = async () => {
    setIsAlertDialogOpen(false);
    setShowTakeover(true);
    try {
      if (!user || user.minutes <= 0 || user.minutes < duration) {
        toast.error("You don't have enough minutes to create an interview.");
        return;
      }

      if (!cvText?.trim() || !jobDescriptionText?.trim()) {
        toast.error("Please provide both CV and job description.");
        return;
      }

      const interview: NewInterview = {
        submittedCVText: sanitiseUserInputText(cvText, {
          truncate: true,
          maxLength: config.maxTextLengths.cv,
        }),
        jobDescriptionText: sanitiseUserInputText(jobDescriptionText, {
          truncate: true,
          maxLength: config.maxTextLengths.jobDescription,
        }),
        additionalInfo: sanitiseUserInputText(additionalInfo, {
          truncate: true,
          maxLength: config.maxTextLengths.additionalInfo,
        }),
        userId: user?.id,
        duration,
        type: interviewType,
      };

      posthog.capture("create_interview", {
        userId: user?.id,
      });

      await createInterviewMutation.mutateAsync(interview);
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "handleConfirmSubmit");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      toast.error("An error occurred while processing your request. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      {/* Gradient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Primary gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background" />

        {/* Decorative gradient elements */}
        <div className="absolute -right-32 top-1/3 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-primary/20 to-secondary/10 blur-3xl opacity-60 animate-float" />
        <div
          className="absolute -left-20 bottom-1/4 w-72 h-72 rounded-full bg-gradient-to-tr from-secondary/20 to-primary/5 blur-2xl opacity-50 animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-20 right-1/4 w-64 h-64 rounded-full bg-gradient-to-tl from-primary-foreground/10 to-secondary/10 blur-xl opacity-40 animate-float"
          style={{ animationDelay: "2s" }}
        />

        {/* Additional subtle elements */}
        <div
          className="absolute bottom-40 right-1/3 w-48 h-48 rounded-full bg-gradient-to-tr from-primary/10 to-background blur-2xl opacity-30 animate-float"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute top-1/2 left-1/4 w-56 h-56 rounded-full bg-gradient-to-bl from-secondary/15 to-background blur-3xl opacity-25 animate-float"
          style={{ animationDelay: "0.5s" }}
        />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-5" />
      </div>

      {/* Theme toggle button */}
      <div className="fixed top-4 right-4 z-[60]">
        <div className="bg-background/40 backdrop-blur-md p-2 rounded-full border border-border/30 shadow-sm">
          <ThemeToggle />
        </div>
      </div>

      {/* Sticky Header */}
      <header className="fixed top-0 z-50 w-full bg-background/70 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto w-full px-3 md:px-6 py-4 md:py-5">
          <div className="flex items-center justify-between">
            <div className="w-20 md:w-24">
              <Button
                variant="outline"
                size="sm"
                disabled={step === 1}
                onClick={handleBack}
                className={cn(
                  "flex items-center gap-1 text-muted-foreground hover:text-foreground",
                  step === 1 && "opacity-50 pointer-events-none"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden xs:inline">Back</span>
              </Button>
            </div>

            {/* Step Indicators */}
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
                {[1, 2, 3].map((stepNum) => (
                  <div
                    key={stepNum}
                    className={cn(
                      "flex flex-col items-center relative z-10 transition-all duration-300",
                      stepNum <= step ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => stepNum < step && setStep(stepNum)}
                      disabled={stepNum >= step}
                      aria-current={step === stepNum ? "step" : undefined}
                      aria-label={`Go to step ${stepNum}: ${stepNum === 1 ? "CV" : stepNum === 2 ? "Job Details" : "Settings"}`}
                      className={cn(
                        "w-9 h-9 xs:w-10 xs:h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 shadow",
                        animateStep === stepNum && "animate-step-complete",
                        step === stepNum
                          ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background shadow-md scale-110"
                          : stepNum < step
                            ? "bg-primary text-primary-foreground border-none hover:ring-2 hover:ring-primary/20 hover:ring-offset-2 hover:ring-offset-background cursor-pointer"
                            : "bg-muted text-muted-foreground border border-border cursor-default"
                      )}
                    >
                      {stepNum < step ? <Check className="h-5 w-5" /> : stepNum}
                    </button>
                    <span
                      className={cn(
                        "text-xs mt-2 font-medium text-center",
                        step === stepNum
                          ? "text-foreground"
                          : stepNum < step
                            ? "text-primary"
                            : "text-muted-foreground"
                      )}
                    >
                      {stepNum === 1 ? "CV" : stepNum === 2 ? "Job Details" : "Settings"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-20 md:w-24 flex justify-end">
              <Button
                size="sm"
                disabled={
                  createInterviewMutation.isPending ||
                  (step === 2 && !canProceedToStep3) ||
                  (step === 1 && !canProceedToStep2)
                }
                onClick={() => {
                  if (step !== 3) {
                    handleNextStep(step);
                  } else {
                    handleSubmit();
                  }
                }}
                className="flex items-center gap-1"
              >
                {createInterviewMutation.isPending ? (
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

      {/* Centered Main Content Area */}
      <div className="flex-1 flex flex-col justify-center items-center w-full px-4 md:px-6 lg:px-8 py-16 mt-16 min-h-[calc(100vh-64px)]">
        <div className="bg-card/95 backdrop-blur-md rounded-xl shadow-xl border border-border/40 overflow-hidden w-full max-w-7xl animate-in fade-in slide-in-from-bottom-8 duration-500">
          {step === 1 && <Step1CV />}
          {step === 2 && <Step2JobDescription />}
          {step === 3 && <Step3AdditionalInfo />}
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

      {/* Modals */}
      <ConfirmationModal
        isOpen={isAlertDialogOpen}
        onClose={() => setIsAlertDialogOpen(false)}
        onConfirm={handleConfirmSubmit}
        userMinutes={user?.minutes || 0}
      />

      <OutOfMinutesModal
        isOpen={isOutOfMinutesDialogOpen}
        onClose={() => setIsOutOfMinutesDialogOpen(false)}
        onBuyMinutes={() => router.push("/pricing")}
      />

      <CreateInterviewErrorModal
        isOpen={isScheduleErrorDialogOpen}
        onTryAgain={() => handleSubmit()}
        onClose={() => {
          setIsScheduleErrorDialogOpen(false);
        }}
      />

      <AnimatePresence>{showTakeover && <ProcessingTakeover />}</AnimatePresence>
      <AnotherBackgroundGradient degrees={Math.random() * 360} />
    </div>
  );
}
