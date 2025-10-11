"use client";

import { getRepository } from "@/lib/data/repositoryFactory";
import { sanitiseUserInputText } from "@/lib/sanitiseUserInputText";
import { clientIdHandler } from "@/lib/utils/clientIdHandler";
import { secureFetch } from "@/lib/utils/secure-fetch";
import { useCreateJobActions } from "@/stores/createJobStore";
import * as Sentry from "@sentry/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { toast } from "sonner";
import { config } from "~/config";
import type { NewJob } from "~/db/schema";

interface UseJobSubmissionProps {
  userId?: number;
  cvText: string;
  jobDescriptionText: string;
  additionalInfo: string;
}

export function useJobSubmission({
  userId,
  cvText,
  jobDescriptionText,
  additionalInfo,
}: UseJobSubmissionProps) {
  const router = useRouter();
  const posthog = usePostHog();
  const { setShowTakeover, setIsScheduleErrorDialogOpen, setErrorMessage, resetStore } =
    useCreateJobActions();

  const createJobMutation = useMutation({
    mutationFn: async (job: NewJob) => {
      const jobsRepository = await getRepository<NewJob>("jobs", true);
      const createdJob = await jobsRepository.create(job);

      const jobDescriptionExtractionPromise = secureFetch("/api/extract/job-description", {
        method: "POST",
        body: JSON.stringify({
          jobId: clientIdHandler.formatId(createdJob.sys.id),
          jobDescriptionText,
        }),
      }).catch((err) => {
        // Extract meaningful error message
        let errorMessage = "Failed to extract job description";
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        throw new Error(errorMessage);
      });

      const candidateDetailsExtractionPromise = secureFetch("/api/extract/candidate-details", {
        method: "POST",
        body: JSON.stringify({
          jobId: clientIdHandler.formatId(createdJob.sys.id),
          cvText,
        }),
      }).catch((err) => {
        // Extract meaningful error message
        let errorMessage = "Failed to extract candidate details";
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        throw new Error(errorMessage);
      });

      const results = await Promise.allSettled([
        jobDescriptionExtractionPromise,
        candidateDetailsExtractionPromise,
      ]);

      // Check if any extractions failed
      const failures = results.filter((r) => r.status === "rejected");
      if (failures.length > 0) {
        const failureReasons = failures
          .map((f) => (f.status === "rejected" ? f.reason?.message || "Unknown error" : ""))
          .filter(Boolean)
          .join("; ");
        throw new Error(`Extraction failed: ${failureReasons}`);
      }

      return createdJob;
    },
    onSuccess: (data) => {
      setShowTakeover(true);
      setTimeout(() => {
        resetStore();
        router.push(`/dashboard/jobs/${clientIdHandler.formatId(data.sys.id)}/interviews/new`);
      }, 9000);
    },
    onError: (error) => {
      // Hide takeover on error
      setShowTakeover(false);

      Sentry.withScope((scope) => {
        scope.setExtra("context", "createJobMutation");
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });

      // Set the specific error message
      const errMsg = error instanceof Error ? error.message : "Failed to create job";
      setErrorMessage(errMsg);
      setIsScheduleErrorDialogOpen(true);
    },
  });

  const submitJob = async () => {
    setShowTakeover(true);

    try {
      if (!cvText?.trim() || !jobDescriptionText?.trim()) {
        toast.error("Please provide both CV and job description.");
        return;
      }

      const job: NewJob = {
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
      };

      posthog.capture("create_job", {
        userId,
      });

      await createJobMutation.mutateAsync(job);
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

  return {
    isSubmitting: createJobMutation.isPending,
    submitJob,
  };
}
