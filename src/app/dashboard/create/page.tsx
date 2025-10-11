"use client";

import { ConfirmationModal } from "@/components/create-optimization/ConfirmationModal";
import { CreateJobErrorModal } from "@/components/create-optimization/CreateJobErrorModal";
import { OutOfMinutesModal } from "@/components/create-optimization/OutOfMinutesModal";
import { ProcessingTakeover } from "@/components/create-optimization/ProcessingTakeover";
import { useUser } from "@/hooks/useUser";
import {
  useCreateJobActions,
  useCreateJobAdditionalInfo,
  useCreateJobCVText,
  useCreateJobErrorMessage,
  useCreateJobIsAlertDialogOpen,
  useCreateJobIsOutOfMinutesDialogOpen,
  useCreateJobIsScheduleErrorDialogOpen,
  useCreateJobJobDescriptionText,
  useCreateJobShowTakeover,
  useCreateJobStep,
} from "@/stores/createJobStore";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ContentArea } from "./components/ContentArea";
import { useJobSubmission } from "./hooks/useJobSubmission";

export default function CreateJob() {
  const step = useCreateJobStep();
  const cvText = useCreateJobCVText();
  const jobDescriptionText = useCreateJobJobDescriptionText();
  const additionalInfo = useCreateJobAdditionalInfo();
  const showTakeover = useCreateJobShowTakeover();
  const isAlertDialogOpen = useCreateJobIsAlertDialogOpen();
  const isOutOfMinutesDialogOpen = useCreateJobIsOutOfMinutesDialogOpen();
  const isScheduleErrorDialogOpen = useCreateJobIsScheduleErrorDialogOpen();
  const errorMessage = useCreateJobErrorMessage();

  const {
    setStep,
    setIsAlertDialogOpen,
    setIsOutOfMinutesDialogOpen,
    setIsScheduleErrorDialogOpen,
    setErrorMessage,
  } = useCreateJobActions();

  const router = useRouter();

  const [animateStep, setAnimateStep] = useState<number | null>(null);
  const [animationDir, setAnimationDir] = useState(0);
  const { data: user } = useUser();

  // Handle animation timing
  useEffect(() => {
    if (animateStep !== null) {
      const timer = setTimeout(() => {
        setAnimateStep(null);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [animateStep]);

  // Navigation and validation logic
  const canProceedToStep2 = jobDescriptionText?.trim().length > 0;
  const canProceedToStep3 = cvText?.trim().length > 0;
  const canProceedToNextStep =
    (step === 1 && canProceedToStep2) || (step === 2 && canProceedToStep3) || step === 3;

  const { isSubmitting, submitJob } = useJobSubmission({
    userId: user?.id,
    cvText,
    jobDescriptionText,
    additionalInfo,
  });

  const handleNextStep = () => {
    if (step === 1 && canProceedToStep2) {
      setAnimationDir(1);
      setAnimateStep(1);
      setStep(2);
    } else if (step === 2 && canProceedToStep3) {
      setAnimationDir(1);
      setAnimateStep(2);
      setStep(3);
    }
  };

  const handleBack = () => {
    setAnimationDir(-1);
    setStep(Math.max(1, step - 1));
  };

  const handleSubmit = () => {
    // Check if user has enough minutes
    if (!user || user.minutes <= 0) {
      setIsOutOfMinutesDialogOpen(true);
    } else {
      setIsAlertDialogOpen(true);
    }
  };

  const handleConfirmSubmit = () => {
    setIsAlertDialogOpen(false);
    submitJob();
  };

  return (
    <>
      {/* Main content with navigation controls */}
      <ContentArea
        animationDir={animationDir}
        canProceedToNextStep={canProceedToNextStep}
        isSubmitting={isSubmitting}
        onBack={handleBack}
        onNext={handleNextStep}
        onSubmit={handleSubmit}
        animateStep={animateStep}
      />

      <ConfirmationModal
        isOpen={isAlertDialogOpen}
        onClose={() => setIsAlertDialogOpen(false)}
        onConfirm={handleConfirmSubmit}
        userMinutes={user?.minutes ?? 0}
      />

      <OutOfMinutesModal
        isOpen={isOutOfMinutesDialogOpen}
        onClose={() => setIsOutOfMinutesDialogOpen(false)}
        onBuyMinutes={() => router.push("/pricing")}
      />

      <CreateJobErrorModal
        isOpen={isScheduleErrorDialogOpen}
        errorMessage={errorMessage}
        onTryAgain={() => {
          setIsScheduleErrorDialogOpen(false);
          setErrorMessage(undefined);
          handleConfirmSubmit();
        }}
        onClose={() => {
          setIsScheduleErrorDialogOpen(false);
          setErrorMessage(undefined);
        }}
      />

      {/* Processing takeover for success state */}
      <AnimatePresence>{showTakeover && <ProcessingTakeover />}</AnimatePresence>
    </>
  );
}
