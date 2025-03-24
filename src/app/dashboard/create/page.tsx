"use client";

import { BackgroundGradient as AnotherBackgroundGradient } from "@/components/background-gradient";
import { ConfirmationModal } from "@/components/create-optimization/ConfirmationModal";
import { CreateInterviewErrorModal } from "@/components/create-optimization/CreateInterviewErrorModal";
import { OutOfMinutesModal } from "@/components/create-optimization/OutOfMinutesModal";
import { ProcessingTakeover } from "@/components/create-optimization/ProcessingTakeover";
import { Step1CV } from "@/components/create-optimization/Step1CV";
import { Step2JobDescription } from "@/components/create-optimization/Step2JobDescription";
import { Step3AdditionalInfo } from "@/components/create-optimization/Step3AdditionalInfo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
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

  const router = useRouter();
  const posthog = usePostHog();
  const { data: user } = useUser();

  const canProceedToStep2 = cvText?.trim().length > 0;
  const canProceedToStep3 = jobDescriptionText?.trim().length > 0;

  const handleNextStep = (currentStep: number) => {
    if (currentStep === 1 && canProceedToStep2) {
      setStep(2);
    } else if (currentStep === 2 && canProceedToStep3) {
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
      console.log("error:", error);
      Sentry.withScope((scope) => {
        scope.setExtra("context", "handleConfirmSubmit");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      toast.error("An error occurred while processing your request. Please try again.");
    }
  };

  return (
    <div className="relative flex flex-col h-full overflow-y-auto pb-[env(safe-area-inset-bottom)]">
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="max-w-4xl mx-auto w-full px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" disabled={step === 1} onClick={handleBack} size="sm">
              Back
            </Button>

            <div className="flex items-center justify-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step === 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                1
              </div>
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step === 2
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                2
              </div>
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step === 3
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                3
              </div>
            </div>

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
            >
              {createInterviewMutation.isPending ? "Submitting..." : step === 3 ? "Submit" : "Next"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 container max-w-4xl mx-auto px-4 py-6 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <Card>
          <CardContent className="p-6 sm:p-8">
            {step === 1 && <Step1CV />}
            {step === 2 && <Step2JobDescription />}
            {step === 3 && <Step3AdditionalInfo />}
          </CardContent>
        </Card>
      </div>

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
