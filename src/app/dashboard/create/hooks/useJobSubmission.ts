"use client";

import { getRepository } from "@/lib/data/repositoryFactory";
import { sanitiseUserInputText } from "@/lib/sanitiseUserInputText";
import { idHandler } from "@/lib/utils/idHandler";
import { type InterviewType, useCreateJobActions } from "@/stores/createJobStore";
import * as Sentry from "@sentry/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { toast } from "sonner";
import { config } from "~/config";
import type { NewInterview } from "~/db/schema";

interface UseJobSubmissionProps {
  userId?: number;
  userMinutes?: number;
  cvText: string;
  jobDescriptionText: string;
  additionalInfo: string;
  duration: number;
  interviewType: InterviewType;
}

export function useJobSubmission({
  userId,
  userMinutes = 0,
  cvText,
  jobDescriptionText,
  additionalInfo,
  duration,
  interviewType,
}: UseJobSubmissionProps) {
  const router = useRouter();
  const posthog = usePostHog();
  const { setShowTakeover, setIsScheduleErrorDialogOpen, resetStore } = useCreateJobActions();

  const createJobMutation = useMutation({
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
      toast.success("Job created successfully");
      setShowTakeover(true);
      setTimeout(() => {
        resetStore();
        router.push(`/dashboard/interviews/${idHandler.encode(data.sys.id ?? 0)}`);
        // setShowTakeover(false);
      }, 9000);
    },
    onError: (error) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "createJobMutation");
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });
      setIsScheduleErrorDialogOpen(true);
    },
  });

  const hasEnoughMinutes = userMinutes >= duration;

  const submitJob = async () => {
    setShowTakeover(true);

    try {
      if (!hasEnoughMinutes) {
        toast.error("You don't have enough minutes to create a job.");
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
        userId,
        duration,
        type: interviewType,
      };

      posthog.capture("create_job", {
        userId,
      });

      await createJobMutation.mutateAsync(interview);
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "submitJob");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      toast.error("An error occurred while processing your request. Please try again.");
      setShowTakeover(false);
    }
  };

  const checkMinutes = () => {
    if (!hasEnoughMinutes) {
      posthog.capture("out_of_minutes", {
        userId,
      });
      return false;
    }
    return true;
  };

  return {
    isSubmitting: createJobMutation.isPending,
    hasEnoughMinutes,
    submitJob,
    checkMinutes,
  };
}
