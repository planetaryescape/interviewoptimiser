"use client";

import { CreateJobErrorModal } from "@/components/create-optimization/CreateJobErrorModal";
import { OutOfMinutesModal } from "@/components/create-optimization/OutOfMinutesModal";
import { ProcessingTakeover } from "@/components/create-optimization/ProcessingTakeover";
import { useUser } from "@/hooks/useUser";
import {
  useCreateJobActions,
  useCreateJobAdditionalInfo,
  useCreateJobCVText,
  useCreateJobDuration,
  useCreateJobInterviewType,
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
  const isOutOfMinutesDialogOpen = useCreateJobIsOutOfMinutesDialogOpen();
  const isScheduleErrorDialogOpen = useCreateJobIsScheduleErrorDialogOpen();
  const duration = useCreateJobDuration();
  const interviewType = useCreateJobInterviewType();

  const { setStep, setIsOutOfMinutesDialogOpen, setIsScheduleErrorDialogOpen } =
    useCreateJobActions();

  const [animateStep, setAnimateStep] = useState<number | null>(null);
  const [animationDir, setAnimationDir] = useState(0);
  const { data: user } = useUser();
  const router = useRouter();

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

  const { isSubmitting, submitJob, checkMinutes } = useJobSubmission({
    userId: user?.id,
    userMinutes: user?.minutes,
    cvText,
    jobDescriptionText,
    additionalInfo,
    duration,
    interviewType,
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
    if (!checkMinutes()) {
      setIsOutOfMinutesDialogOpen(true);
    } else {
      submitJob();
    }
  };

  const handleBuyMinutes = () => {
    router.push("/pricing");
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

      {/* Modals */}
      <OutOfMinutesModal
        isOpen={isOutOfMinutesDialogOpen}
        onClose={() => setIsOutOfMinutesDialogOpen(false)}
        onBuyMinutes={handleBuyMinutes}
      />

      <CreateJobErrorModal
        isOpen={isScheduleErrorDialogOpen}
        onTryAgain={handleSubmit}
        onClose={() => {
          setIsScheduleErrorDialogOpen(false);
        }}
      />

      {/* Processing takeover for success state */}
      <AnimatePresence>{showTakeover && <ProcessingTakeover />}</AnimatePresence>
    </>
  );
}
