"use client";

import { getRepository } from "@/lib/data/repositoryFactory";
import { clientIdHandler } from "@/lib/utils/clientIdHandler";
import {
  ONE_MINUTE_LEFT_MESSAGE,
  formatTranscript,
  formatTranscriptToJsonString,
} from "@/lib/utils/messageUtils";
import { unformatTime } from "@/lib/utils/unformatTime";
import {
  type InterviewWithPublicJobId,
  useActiveInterview,
  useActiveInterviewActions,
  useActiveInterviewCallDuration,
  useActiveInterviewEnded,
  useActiveInterviewTotalTime,
  useActiveInterviewWrapUpSent,
} from "@/stores/useActiveInterviewStore";
import { useVoice } from "@humeai/voice-react";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { User } from "~/db/schema";
import { useTranscriptSave } from "~/lib/hooks/use-transcript-save";

interface InterviewControllerProps {
  interviewId: string;
  jobId: string;
  interviewStateMachine?: any;
  onForceSaveReady?: (forceSave: () => Promise<void>) => void;
}

export const InterviewController = React.memo(function InterviewController({
  interviewId,
  jobId,
  interviewStateMachine,
  onForceSaveReady,
}: InterviewControllerProps) {
  const params = useParams();
  const queryClient = useQueryClient();
  const lastDecrementTimeRef = useRef<number>(0);
  const endingInterviewRef = useRef(false);
  const unmountedRef = useRef(false);
  const chatMetadataSavedRef = useRef(false);

  const callDurationTimestamp = useActiveInterviewCallDuration();
  const totalTime = useActiveInterviewTotalTime();
  const wrapUpSent = useActiveInterviewWrapUpSent();
  const interviewEnded = useActiveInterviewEnded();

  const {
    setCallDurationTimestamp,
    setInterviewEnded,
    markWrapUpSent,
    setMessages,
    setActiveInterview,
  } = useActiveInterviewActions();

  const activeInterview = useActiveInterview();

  const {
    status,
    callDurationTimestamp: voiceTimestamp,
    sendUserInput,
    sendAssistantInput,
    messages,
    sendSessionSettings,
    disconnect,
    chatMetadata,
  } = useVoice();

  // Set unmounted flag on component unmount
  useEffect(() => {
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  // Update store with voice state (backward compatibility)
  useEffect(() => {
    let mounted = true;

    if (mounted && voiceTimestamp) {
      setCallDurationTimestamp(voiceTimestamp);
    }

    if (mounted && messages && messages.length > 0) {
      const storeCompatibleMessages = formatTranscript(messages);
      setMessages(storeCompatibleMessages);
    }

    return () => {
      mounted = false;
    };
  }, [voiceTimestamp, messages, setCallDurationTimestamp, setMessages]);

  // Partial interview update function for use-transcript-save
  const updateInterviewFn = useCallback(
    async (interview: Partial<InterviewWithPublicJobId>) => {
      const interviewRepo = await getRepository<InterviewWithPublicJobId>("interviews");
      return await interviewRepo.update(clientIdHandler.formatId(activeInterview?.id), interview);
    },
    [activeInterview?.id]
  );

  // Use new transcript save hook (replaces partial mutation for transcripts)
  const { forceSave, isSaving, lastSaveTime, hasError } = useTranscriptSave(messages, {
    interviewId,
    jobId,
    updateInterviewFn,
    onSaveSuccess: (interview) => {
      if (!unmountedRef.current && interview) {
        setActiveInterview({
          ...interview.data,
          id: interview.data.id || 0,
          customSessionId: interview.data.customSessionId || null,
          requestId: interview.data.requestId || null,
          actualTime: interview.data.actualTime || null,
          transcript: interview.data.transcript || null,
          jobId: params.jobId as string,
          createdAt: interview.data.createdAt || new Date(),
          updatedAt: interview.data.updatedAt || new Date(),
          humeChatId: chatMetadata?.chatId || interview.data.humeChatId,
        });
      }
    },
  });

  // Expose forceSave to parent via ref to avoid re-render loop
  // (forceSave changes every time messages change, which would cause
  //  parent setState → re-render → children re-render → new forceSave → loop)
  const forceSaveRef = useRef(forceSave);
  forceSaveRef.current = forceSave;

  React.useEffect(() => {
    if (onForceSaveReady) {
      onForceSaveReady(() => forceSaveRef.current());
    }
  }, [onForceSaveReady]);

  // End of interview mutation
  const { mutate: endInterview } = useMutation({
    mutationFn: async (interview: Partial<InterviewWithPublicJobId>) => {
      const interviewRepo = await getRepository<InterviewWithPublicJobId>("interviews");
      return await interviewRepo.update(clientIdHandler.formatId(activeInterview?.id), interview);
    },
    onSuccess: () => {
      if (!unmountedRef.current) {
        // Notify state machine of successful completion
        if (interviewStateMachine) {
          interviewStateMachine.send({ type: "COMPLETION_SUCCESS" });
        }

        sendAssistantInput("hang_up");
        disconnect();
        queryClient.invalidateQueries({
          queryKey: ["job", params.jobId],
        });
        if (!interviewEnded) {
          setInterviewEnded(true);
        }
      }
    },
    onError: (error) => {
      if (!unmountedRef.current) {
        // Notify state machine of completion error
        if (interviewStateMachine) {
          interviewStateMachine.send({
            type: "COMPLETION_ERROR",
            error: error instanceof Error ? error.message : "Failed to end interview",
          });
        }

        sendAssistantInput("hang_up");
        disconnect();
        Sentry.withScope((scope) => {
          scope.setContext("params", params);
          Sentry.captureException(error);
        });
        toast.error("Error ending interview. Just be patient, we will try again.");
        if (!interviewEnded) {
          setInterviewEnded(true);
        }
      }
    },
  });

  // Chat metadata mutation (separate from transcript saves)
  const chatMetadataMutation = useMutation({
    mutationFn: async (interview: Partial<InterviewWithPublicJobId>) => {
      const interviewRepo = await getRepository<InterviewWithPublicJobId>("interviews");
      return await interviewRepo.update(clientIdHandler.formatId(activeInterview?.id), interview);
    },
    onSuccess: (interview) => {
      if (!unmountedRef.current && interview) {
        setActiveInterview({
          ...interview.data,
          id: interview.data.id || 0,
          customSessionId: interview.data.customSessionId || null,
          requestId: interview.data.requestId || null,
          actualTime: interview.data.actualTime || null,
          transcript: interview.data.transcript || null,
          jobId: params.jobId as string,
          createdAt: interview.data.createdAt || new Date(),
          updatedAt: interview.data.updatedAt || new Date(),
          humeChatId: chatMetadata?.chatId || interview.data.humeChatId,
        });
      }
    },
    onError: (error) => {
      if (!unmountedRef.current) {
        // Silently log - don't distract user during interview
        Sentry.withScope((scope) => {
          scope.setContext("params", params);
          scope.setExtra("error", error);
          scope.setTag("feature", "interview-metadata");
          Sentry.captureException(error);
        });
      }
    },
  });

  // Save chat metadata once when first connected
  useEffect(() => {
    if (
      chatMetadata?.chatGroupId &&
      chatMetadata.chatId &&
      !chatMetadataSavedRef.current &&
      activeInterview
    ) {
      chatMetadataSavedRef.current = true;

      chatMetadataMutation.mutate({
        ...activeInterview,
        jobId: params.jobId as string,
        chatGroupId: chatMetadata.chatGroupId,
        customSessionId: chatMetadata.customSessionId || null,
        requestId: chatMetadata.requestId || null,
        humeChatId: chatMetadata.chatId,
      });
    }
  }, [chatMetadata, activeInterview, params.jobId, chatMetadataMutation]);

  // Usage tracking mutation (CRITICAL - billing logic)
  const decrementMutation = useMutation({
    mutationFn: async () => {
      const repository = await getRepository<User>("users");
      const response = await repository.update("minutes/decrement", {});
      return response;
    },
    onSuccess: (updatedUser) => {
      if (!unmountedRef.current) {
        if (updatedUser && updatedUser.data.minutes <= 0) {
          disconnect();
          toast.error("You've run out of minutes. The interview has been stopped.");
        }

        queryClient.invalidateQueries({ queryKey: ["user"] });
      }
    },
    onError: (error) => {
      if (!unmountedRef.current) {
        Sentry.captureException(error, {
          contexts: {
            function: {
              name: "decrementMutation.onError",
            },
          },
        });
        toast.error("Failed to update remaining minutes");
      }
    },
  });

  // Message handling functions
  const handleSendUserInput = useCallback(
    (message: string) => {
      if (status.value === "connected") {
        sendUserInput(message);
      }
    },
    [sendUserInput, status.value]
  );

  // Time-based actions (one minute warning, end interview)
  useEffect(() => {
    let mounted = true;

    if (!mounted || status.value !== "connected") return;
    if (!callDurationTimestamp) return;
    if (interviewEnded || endingInterviewRef.current) return;

    const elapsedTime = unformatTime(callDurationTimestamp);

    // One minute warning
    if (mounted && elapsedTime === totalTime - 60 && !wrapUpSent) {
      handleSendUserInput(ONE_MINUTE_LEFT_MESSAGE);
      sendSessionSettings({
        context: {
          text: ONE_MINUTE_LEFT_MESSAGE,
          type: "persistent",
        },
      });
      markWrapUpSent();
    }

    // End interview at time limit
    if (mounted && elapsedTime === totalTime && !interviewEnded && !endingInterviewRef.current) {
      endingInterviewRef.current = true;

      // Transition state machine to completing state (timeout = user-initiated)
      if (interviewStateMachine) {
        interviewStateMachine.send({ type: "USER_DISCONNECT" });
      }

      // Force save transcript before ending
      forceSave();

      endInterview({
        ...activeInterview,
        jobId: params.jobId as string,
        humeChatId: chatMetadata?.chatId || activeInterview?.humeChatId,
        actualTime: Math.floor(elapsedTime / 60),
        transcript: formatTranscriptToJsonString(messages),
      });
    }

    return () => {
      mounted = false;
    };
  }, [
    status.value,
    callDurationTimestamp,
    totalTime,
    wrapUpSent,
    interviewEnded,
    chatMetadata?.chatId,
    messages,
    handleSendUserInput,
    markWrapUpSent,
    activeInterview,
    params.jobId,
    sendSessionSettings,
    endInterview,
    forceSave,
    interviewStateMachine,
  ]);

  // Usage tracking (billing - runs every minute)
  useEffect(() => {
    let mounted = true;

    if (mounted && status.value === "connected") {
      if (!callDurationTimestamp) return;

      const currentTime = unformatTime(callDurationTimestamp);
      if (Math.floor(currentTime / 60) > Math.floor(lastDecrementTimeRef.current / 60)) {
        lastDecrementTimeRef.current = currentTime;

        if (mounted) {
          // Decrement minutes used (billing)
          decrementMutation.mutate();

          // Update store with current time
          if (activeInterview) {
            setActiveInterview({
              ...activeInterview,
              actualTime: Math.floor(currentTime / 60),
              transcript: formatTranscriptToJsonString(messages),
            });
          }
        }
      }
    }

    return () => {
      mounted = false;
    };
  }, [
    status.value,
    callDurationTimestamp,
    messages,
    decrementMutation,
    activeInterview,
    setActiveInterview,
  ]);

  // Handle AI-initiated hang_up (complete interview when AI disconnects)
  useEffect(() => {
    let mounted = true;

    // Only process when state machine transitions to ai_completing
    if (
      mounted &&
      interviewStateMachine?.state === "ai_completing" &&
      !interviewEnded &&
      !endingInterviewRef.current
    ) {
      endingInterviewRef.current = true;

      const elapsedTime = callDurationTimestamp ? unformatTime(callDurationTimestamp) : 0;

      // Complete the interview (transcript already force-saved in handleVoiceMessage)
      endInterview({
        ...activeInterview,
        jobId: params.jobId as string,
        humeChatId: chatMetadata?.chatId || activeInterview?.humeChatId,
        actualTime: Math.floor(elapsedTime / 60),
        transcript: formatTranscriptToJsonString(messages),
      });
    }

    return () => {
      mounted = false;
    };
  }, [
    interviewStateMachine?.state,
    interviewEnded,
    callDurationTimestamp,
    activeInterview,
    params.jobId,
    chatMetadata?.chatId,
    messages,
    endInterview,
  ]);

  return null; // Controller component doesn't render anything
});
