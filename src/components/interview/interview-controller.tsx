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

export const InterviewController = React.memo(function InterviewController() {
  const params = useParams();
  const queryClient = useQueryClient();
  const lastDecrementTimeRef = useRef<number>(0);
  const endingInterviewRef = useRef(false);
  const unmountedRef = useRef(false);

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
    disconnect,
    status,
    callDurationTimestamp: voiceTimestamp,
    sendUserInput,
    sendAssistantInput,
    messages,
    sendSessionSettings,
    connect,
    chatMetadata,
  } = useVoice();

  const interviewStartedRef = useRef(false);

  // Set unmounted flag on component unmount
  useEffect(() => {
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  useEffect(() => {
    if (!interviewStartedRef.current) {
      connect();
      interviewStartedRef.current = true;
    }

    return () => {
      if (status.value === "connected") {
        disconnect();
      }
    };
  }, [connect, disconnect, status.value]);

  // Update store with voice state
  useEffect(() => {
    let mounted = true;

    if (mounted && voiceTimestamp) {
      setCallDurationTimestamp(voiceTimestamp);
    }

    if (mounted && messages && messages.length > 0) {
      // Convert the voice messages to the format expected by our store
      const storeCompatibleMessages = formatTranscript(messages);

      setMessages(storeCompatibleMessages);
    }

    return () => {
      mounted = false;
    };
  }, [voiceTimestamp, messages, setCallDurationTimestamp, setMessages]);

  // End of interview mutation
  const { mutate: endInterview } = useMutation({
    mutationFn: async (interview: Partial<InterviewWithPublicJobId>) => {
      const interviewRepo = await getRepository<InterviewWithPublicJobId>("interviews");
      return await interviewRepo.update(clientIdHandler.formatId(activeInterview?.id), interview);
    },
    onSuccess: () => {
      if (!unmountedRef.current) {
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

  // Partial transcript mutation
  const partialInterviewMutation = useMutation({
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
        Sentry.withScope((scope) => {
          scope.setContext("params", params);
          scope.setExtra("error", error);
          Sentry.captureException(error);
        });
        toast.error("Error updating interview. Please try again.");
      }
    },
  });

  // Usage tracking mutation
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

  // Time-based actions
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
          type: "editable",
        },
      });
      markWrapUpSent();
    }

    // End interview
    if (mounted && elapsedTime === totalTime && !interviewEnded && !endingInterviewRef.current) {
      endingInterviewRef.current = true;
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
  ]);

  // Usage tracking
  useEffect(() => {
    let mounted = true;

    if (mounted && status.value === "connected") {
      if (!callDurationTimestamp) return;

      const currentTime = unformatTime(callDurationTimestamp);
      if (Math.floor(currentTime / 60) > Math.floor(lastDecrementTimeRef.current / 60)) {
        lastDecrementTimeRef.current = currentTime;

        if (mounted) {
          // Decrement minutes used
          decrementMutation.mutate();

          if (activeInterview) {
            setActiveInterview({
              ...activeInterview,
              actualTime: Math.floor(currentTime / 60),
              transcript: formatTranscriptToJsonString(messages),
            });
          }

          partialInterviewMutation.mutate({
            ...activeInterview,
            jobId: params.jobId as string,
            humeChatId: chatMetadata?.chatId || activeInterview?.humeChatId,
            actualTime: Math.floor(currentTime / 60),
            transcript: formatTranscriptToJsonString(messages),
          });
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
    partialInterviewMutation,
    decrementMutation,
    activeInterview,
    params.jobId,
    chatMetadata?.chatId,
    setActiveInterview,
  ]);

  return null; // Controller component doesn't render anything
});
