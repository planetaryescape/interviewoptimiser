import { formatTranscriptToJsonString } from "@/lib/utils/messageUtils";
import type { InterviewWithPublicJobId } from "@/stores/useActiveInterviewStore";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { transcriptPersistence } from "../utils/transcript-persistence";

interface UseTranscriptSaveOptions {
  interviewId: string;
  userId?: string;
  jobId: string;
  onSaveSuccess?: (data: any) => void;
  updateInterviewFn: (interview: Partial<InterviewWithPublicJobId>) => Promise<any>;
}

const FAILURE_THRESHOLD = 3; // Show error after 3 consecutive failures

export function useTranscriptSave(
  messages: any[],
  { interviewId, userId, jobId, onSaveSuccess, updateInterviewFn }: UseTranscriptSaveOptions
) {
  const hasAttemptedRecoveryRef = useRef(false);
  const lastSyncedMessagesRef = useRef<string>("");
  const consecutiveFailuresRef = useRef(0);
  const [hasPendingRetry, setHasPendingRetry] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  // Save to server mutation
  const saveMutation = useMutation({
    mutationFn: async (messagesToSave: any[]) => {
      const transcript = formatTranscriptToJsonString(messagesToSave);

      return await updateInterviewFn({
        id: Number.parseInt(interviewId, 10),
        jobId,
        transcript,
      });
    },
    retry: 2,
    retryDelay: 1000,
    onSuccess: async (response, variables) => {
      // Reset failure count on success
      consecutiveFailuresRef.current = 0;
      setHasPendingRetry(false);
      setLastSaveTime(new Date());

      // Mark as synced in localStorage
      await transcriptPersistence.markAsSynced(interviewId);
      lastSyncedMessagesRef.current = JSON.stringify(variables);

      onSaveSuccess?.(response);
    },
    onError: () => {
      // Increment failure count
      consecutiveFailuresRef.current += 1;
      setHasPendingRetry(true);

      // Only show error after threshold reached
      if (consecutiveFailuresRef.current >= FAILURE_THRESHOLD) {
        toast.error(
          "Having connection issues. Your progress is saved locally - refresh to continue or try again later.",
          {
            duration: 10000,
            id: "save-failure", // Prevent duplicate toasts
          }
        );
      }
      // Otherwise, fail silently - we'll retry on next message
    },
  });

  // Save to localStorage + server (debounced to avoid spam)
  const saveTranscript = useCallback(
    async (messagesToSave: any[]) => {
      if (messagesToSave.length === 0) return;

      // Check if messages actually changed
      const messagesString = JSON.stringify(messagesToSave);
      if (messagesString === lastSyncedMessagesRef.current) {
        return; // No changes, skip save
      }

      // 1. Save to localStorage immediately (backup)
      await transcriptPersistence.saveToLocalStorage(interviewId, userId, messagesToSave);

      // 2. Try to save to server
      saveMutation.mutate(messagesToSave);
    },
    [interviewId, userId, saveMutation]
  );

  // Debounce saves to avoid API spam (8s to reduce overlapping calls)
  const debouncedSave = useDebouncedCallback(saveTranscript, 8000);

  // Auto-save when messages change
  useEffect(() => {
    if (messages.length > 0) {
      debouncedSave(messages);
    }
  }, [messages, debouncedSave]);

  // Retry failed saves when new messages arrive
  useEffect(() => {
    if (hasPendingRetry && messages.length > 0) {
      // Wait a bit before retrying to avoid immediate re-failure
      const retryTimer = setTimeout(() => {
        saveTranscript(messages);
      }, 2000);

      return () => clearTimeout(retryTimer);
    }
  }, [messages, hasPendingRetry, saveTranscript]);

  // On mount: Silently recover from localStorage and sync
  useEffect(() => {
    if (hasAttemptedRecoveryRef.current) return;
    hasAttemptedRecoveryRef.current = true;

    const attemptRecovery = async () => {
      const backup = await transcriptPersistence.loadFromLocalStorage(interviewId);

      // If we have messages in localStorage, try to sync them
      if (backup && backup.transcript.length > 0) {
        // Silently attempt to sync - don't notify user unless it fails multiple times
        try {
          await saveMutation.mutateAsync(backup.transcript);
        } catch {
          // Will be retried on next message
        }
      }
    };

    attemptRecovery();
  }, [interviewId, saveMutation]);

  // Force save (for when interview completes)
  const forceSave = useCallback(() => {
    debouncedSave.cancel(); // Cancel any pending debounced saves
    return saveTranscript(messages);
  }, [messages, saveTranscript, debouncedSave]);

  return {
    isSaving: saveMutation.isPending,
    lastSaveTime,
    hasError: consecutiveFailuresRef.current >= FAILURE_THRESHOLD,
    forceSave,
  };
}
