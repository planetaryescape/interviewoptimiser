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
  type ChatWithPublicJobId,
  useActiveInterviewActions,
  useActiveInterviewCallDuration,
  useActiveInterviewChat,
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
    setActiveInterviewChat,
  } = useActiveInterviewActions();

  const activeInterviewChat = useActiveInterviewChat();

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
  const { mutate: endChat } = useMutation({
    mutationFn: async (chat: Partial<ChatWithPublicJobId>) => {
      const chatRepo = await getRepository<ChatWithPublicJobId>("chats");
      return await chatRepo.update(idHandler.encode(activeInterviewChat?.id ?? 0), chat);
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
  const partialChatMutation = useMutation({
    mutationFn: async (chat: Partial<ChatWithPublicJobId>) => {
      const chatRepo = await getRepository<ChatWithPublicJobId>("chats");
      return await chatRepo.update(idHandler.encode(activeInterviewChat?.id ?? 0), chat);
    },
    onSuccess: (chat) => {
      if (chat) {
        setActiveInterviewChat({
          ...chat.data,
          id: chat.data.id || 0,
          customSessionId: chat.data.customSessionId || null,
          requestId: chat.data.requestId || null,
          actualTime: chat.data.actualTime || null,
          transcript: chat.data.transcript || null,
          jobId: params.jobId as string,
          createdAt: chat.data.createdAt || new Date(),
          updatedAt: chat.data.updatedAt || new Date(),
          humeChatId: chatMetadata?.chatId || chat.data.humeChatId,
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
      endChat({
        ...activeInterviewChat,
        jobId: params.jobId as string,
        humeChatId: chatMetadata?.chatId || activeInterviewChat?.humeChatId,
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
    activeInterviewChat,
    params.jobId,
    sendSessionSettings,
    endChat,
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

        partialChatMutation.mutate({
          ...activeInterviewChat,
          jobId: params.jobId as string,
          humeChatId: chatMetadata?.chatId || activeInterviewChat?.humeChatId,
          actualTime: Math.floor(currentTime / 60),
          transcript: formatTranscriptToJsonString(messages),
        });
      }
    }
  }, [
    status.value,
    callDurationTimestamp,
    messages,
    partialChatMutation,
    decrementMutation,
    activeInterviewChat,
    params.jobId,
    chatMetadata?.chatId,
  ]);

  return null; // Controller component doesn't render anything
}
