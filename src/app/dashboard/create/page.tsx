"use client";

import { BackgroundGradient as AnotherBackgroundGradient } from "@/components/background-gradient";
import { ConfirmationModal } from "@/components/create-optimization/ConfirmationModal";
import { OutOfMinutesModal } from "@/components/create-optimization/OutOfMinutesModal";
import { ProcessingTakeover } from "@/components/create-optimization/ProcessingTakeover";
import { ScheduleErrorModal } from "@/components/create-optimization/ScheduleErrorModal";
import { Step1CV } from "@/components/create-optimization/Step1CV";
import { Step2JobDescription } from "@/components/create-optimization/Step2JobDescription";
import { Step3AdditionalInfo } from "@/components/create-optimization/Step3AdditionalInfo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewInterview } from "@/db/schema";
import { useUser } from "@/hooks/useUser";
import { config } from "@/lib/config";
import { getRepository } from "@/lib/data/repositoryFactory";
import { sanitiseUserInputText } from "@/lib/sanitiseUserInputText";
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
import { CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { toast } from "sonner";

export default function CreateInterview() {
  const step = useCreateInterviewStep();
  const cvText = useCreateInterviewCVText();
  const jobDescriptionText = useCreateInterviewJobDescriptionText();
  const additionalInfo = useCreateInterviewAdditionalInfo();
  const showTakeover = useCreateInterviewShowTakeover();
  const isAlertDialogOpen = useCreateInterviewIsAlertDialogOpen();
  const isOutOfMinutesDialogOpen = useCreateInterviewIsOutOfMinutesDialogOpen();
  const isScheduleErrorDialogOpen =
    useCreateInterviewIsScheduleErrorDialogOpen();
  const {
    setStep,
    setShowTakeover,
    setIsAlertDialogOpen,
    setIsOutOfMinutesDialogOpen,
    setIsScheduleErrorDialogOpen,
    resetStore,
  } = useCreateInterviewActions();
  const duration = useCreateInterviewDuration();
  console.log("duration:", duration);
  const interviewType = useCreateInterviewInterviewType();

  const router = useRouter();
  const posthog = usePostHog();
  const { data: user } = useUser();

  const canProceedToStep2 = cvText.trim().length > 0;
  const canProceedToStep3 = jobDescriptionText.trim().length > 0;

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
      const interviewRepository = await getRepository<NewInterview>(
        "interviews",
        true
      );
      return interviewRepository.create(interview);
    },
    onError: (error) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "createOptimizationMutation");
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });
      toast.error(`Error creating interview: ${(error as Error).message}`);
    },
  });

  const submitInterviewMutation = useMutation({
    mutationFn: async (interviewId: number) => {
      const response = await fetch(`/api/interviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId: idHandler.encode(interviewId),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create interview: ${response.status} ${errorText}`
        );
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Interview submitted successfully");
      setShowTakeover(true);
      setTimeout(() => {
        router.push(`/dashboard`);
        setShowTakeover(false);
        resetStore(); // Add this line to reset the store after successful submission
      }, 9000);
    },
    onError: (error) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "submitInterviewMutation");
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });
      setIsScheduleErrorDialogOpen(true);
    },
  });

  const handleSubmit = async () => {
    setIsAlertDialogOpen(true);
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

      if (!cvText.trim() || !jobDescriptionText.trim()) {
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

      // posthog.capture("submit_optimization", {
      //   userId: user?.id,
      // });

      console.log("interview:", interview);
      const createdInterview = await createInterviewMutation.mutateAsync(
        interview
      );

      router.push(
        `/dashboard/interview/${idHandler.encode(createdInterview.sys.id ?? 0)}`
      );
      // await submitInterviewMutation.mutateAsync(
      //   createdInterview.sys.id ?? 0
      // );
    } catch (error) {
      console.log("error:", error);
      Sentry.withScope((scope) => {
        scope.setExtra("context", "handleConfirmSubmit");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      toast.error(
        "An error occurred while processing your request. Please try again."
      );
    }
  };

  const title =
    step === 1
      ? "Give us your CV"
      : step === 2
      ? "Give us the Job Description"
      : "Is there anything else we should know?";

  return (
    <div className="relative pt-4 flex flex-col overflow-y-auto h-full pb-[calc(5em+env(safe-area-inset-bottom))] md:pb-0">
      <Card className="mx-auto max-w-2xl w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="">
          {step === 1 && <Step1CV />}
          {step === 2 && <Step2JobDescription />}
          {step === 3 && <Step3AdditionalInfo />}
        </CardContent>
      </Card>

      <div className="flex-1" />

      <div className="sticky bottom-0 bg-white dark:bg-black p-[1em_1em_calc(1em+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between mx-auto max-w-2xl">
          <Button variant="outline" disabled={step === 1} onClick={handleBack}>
            Back
          </Button>
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span className="font-medium">Minutes:</span>
            <Badge variant="secondary">{user?.minutes}</Badge>
          </div>
          <Button
            disabled={
              createInterviewMutation.isPending ||
              submitInterviewMutation.isPending ||
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
            {createInterviewMutation.isPending ||
            submitInterviewMutation.isPending
              ? "Submitting..."
              : step === 3
              ? "Submit"
              : "Next"}
          </Button>
        </div>
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

      <ScheduleErrorModal
        isOpen={isScheduleErrorDialogOpen}
        onClose={() => {
          setIsScheduleErrorDialogOpen(false);
          router.push("/dashboard");
        }}
      />

      <AnimatePresence>
        {showTakeover && <ProcessingTakeover />}
      </AnimatePresence>
      <AnotherBackgroundGradient degrees={Math.random() * 360} />
    </div>
  );
}
