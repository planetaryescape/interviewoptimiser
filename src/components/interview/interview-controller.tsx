"use client";

import { getRepository } from "@/lib/data/repositoryFactory";
import { idHandler } from "@/lib/utils/idHandler";
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
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { User } from "~/db/schema";
import { logger } from "~/lib/logger";

export function InterviewController() {
  const params = useParams();
  const queryClient = useQueryClient();
  const lastDecrementTimeRef = useRef<number>(0);
  const endingInterviewRef = useRef(false);

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

  useEffect(() => {
    if (!interviewStartedRef.current) {
      connect();
      interviewStartedRef.current = true;
    }
  }, [connect]);

  // Update store with voice state
  useEffect(() => {
    if (voiceTimestamp) {
      setCallDurationTimestamp(voiceTimestamp);
    }

    if (messages && messages.length > 0) {
      // Convert the voice messages to the format expected by our store
      const storeCompatibleMessages = formatTranscript(messages);

      setMessages(storeCompatibleMessages);
    }
  }, [voiceTimestamp, messages, setCallDurationTimestamp, setMessages]);

  // End of interview mutation
  const { mutate: endInterview } = useMutation({
    mutationFn: async (interview: Partial<InterviewWithPublicJobId>) => {
      const interviewRepo = await getRepository<InterviewWithPublicJobId>("interviews");
      return await interviewRepo.update(idHandler.encode(activeInterview?.id ?? 0), interview);
    },
    onSuccess: () => {
      sendAssistantInput("hang_up");
      disconnect();
      queryClient.invalidateQueries({
        queryKey: ["job", params.jobId],
      });
      if (!interviewEnded) {
        setInterviewEnded(true);
      }
    },
    onError: (error) => {
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
    },
  });

  // Audio reconstruction mutation
  const { mutate: requestAudioReconstruction } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/jobs/${params.jobId}/audio-reconstruction`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to initiate audio reconstruction");
      }

      return response.json();
    },
    onSuccess: (data) => {
      logger.info(
        { jobId: params.jobId, reconstructionId: data.data.reconstruction.id },
        "Audio reconstruction initiated"
      );
    },
    onError: (error) => {
      Sentry.withScope((scope) => {
        scope.setContext("params", params);
        scope.setExtra("message", error instanceof Error ? error.message : "Unknown error");

        Sentry.captureException(error);
      });
      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error initiating audio reconstruction"
      );
    },
  });

  // Partial transcript mutation
  const partialInterviewMutation = useMutation({
    mutationFn: async (interview: Partial<InterviewWithPublicJobId>) => {
      const interviewRepo = await getRepository<InterviewWithPublicJobId>("interviews");
      return await interviewRepo.update(idHandler.encode(activeInterview?.id ?? 0), interview);
    },
    onSuccess: (interview) => {
      if (interview) {
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
      Sentry.withScope((scope) => {
        scope.setContext("params", params);
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      toast.error("Error updating interview. Please try again.");
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
      if (updatedUser && updatedUser.data.minutes <= 0) {
        disconnect();
        toast.error("You've run out of minutes. The interview has been stopped.");
      }

      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      console.error("Error decrementing minutes:", error);
      toast.error("Failed to update remaining minutes");
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
    if (status.value !== "connected") return;
    if (!callDurationTimestamp) return;
    if (interviewEnded || endingInterviewRef.current) return;

    const elapsedTime = unformatTime(callDurationTimestamp);

    // One minute warning
    if (elapsedTime === totalTime - 60 && !wrapUpSent) {
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
    if (elapsedTime === totalTime && !interviewEnded && !endingInterviewRef.current) {
      endingInterviewRef.current = true;
      endInterview({
        ...activeInterview,
        jobId: params.jobId as string,
        humeChatId: chatMetadata?.chatId || activeInterview?.humeChatId,
        actualTime: Math.floor(elapsedTime / 60),
        transcript: formatTranscriptToJsonString(messages),
      });
      requestAudioReconstruction();
    }
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
    requestAudioReconstruction,
  ]);

  // Usage tracking
  useEffect(() => {
    if (status.value === "connected") {
      if (!callDurationTimestamp) return;

      const currentTime = unformatTime(callDurationTimestamp);
      if (Math.floor(currentTime / 60) > Math.floor(lastDecrementTimeRef.current / 60)) {
        lastDecrementTimeRef.current = currentTime;

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
}
