"use client";

import Step1JobDescription from "@/components/recruitment/create/Step1JobDescription";
import Step2InterviewSettings from "@/components/recruitment/create/Step2InterviewSettings";
import Step3InterviewQuestions from "@/components/recruitment/create/Step3InterviewQuestions";
import type { StepConfig } from "@/components/ui/stepper/step-indicator";
import { StepperContentArea } from "@/components/ui/stepper/stepper-content-area";
import { useRecruitmentCreateStore } from "@/stores/recruitmentCreateStore";
import { useEffect, useState } from "react";

const TOTAL_STEPS = 3;

// Define steps configuration
const steps: StepConfig[] = [
  { number: 1, label: "Job Description" },
  { number: 2, label: "Interview Settings" },
  { number: 3, label: "Questions" },
];

const RecruitmentCreatePage = () => {
  const {
    currentStep,
    setCurrentStep,
    jobDescriptionText,
    interviewType,
    duration,
    questions,
    resetStore,
  } = useRecruitmentCreateStore();

  const [animateStep, setAnimateStep] = useState<number | null>(null);
  const [animationDir, setAnimationDir] = useState(0);

  // Handle animation timing
  useEffect(() => {
    if (animateStep !== null) {
      const timer = setTimeout(() => {
        setAnimateStep(null);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [animateStep]);

  // Step validation logic
  const canProceedToStep2 = jobDescriptionText?.trim().length > 0;
  const canProceedToStep3 = interviewType && duration > 0;
  const canProceedToFinish = questions.length > 0;

  // Determine if the current step can proceed
  const canProceedToNextStep = (() => {
    switch (currentStep) {
      case 1:
        return canProceedToStep2;
      case 2:
        return canProceedToStep3;
      case 3:
        return canProceedToFinish;
      default:
        return false;
    }
  })();

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setAnimationDir(1);
      setAnimateStep(currentStep + 1);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setAnimationDir(-1);
      setAnimateStep(currentStep - 1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    // Only allow clicking on steps that have been completed or the next available step
    if (stepNumber < currentStep || (stepNumber === currentStep + 1 && canProceedToNextStep)) {
      const direction = stepNumber > currentStep ? 1 : -1;
      setAnimationDir(direction);
      setAnimateStep(stepNumber);
      setCurrentStep(stepNumber);
    }
  };

  const handleFinish = () => {
    // TODO: Implement final submission logic
    alert("Recruitment flow setup finished! (Console for details)");
  };

  const _progressValue = (currentStep / TOTAL_STEPS) * 100;

  // Map step content
  const stepContent = {
    1: <Step1JobDescription />,
    2: <Step2InterviewSettings />,
    3: <Step3InterviewQuestions />,
  };

  return (
    <StepperContentArea
      steps={steps}
      currentStep={currentStep}
      stepContent={stepContent}
      animationDir={animationDir}
      canProceedToNextStep={canProceedToNextStep}
      isSubmitting={false}
      onBack={handlePrevious}
      onNext={handleNext}
      onSubmit={handleFinish}
      animateStep={animateStep}
      onStepClick={handleStepClick}
    />
  );
};

export default RecruitmentCreatePage;
