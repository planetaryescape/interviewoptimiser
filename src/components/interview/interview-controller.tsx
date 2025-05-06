"use client";

import { getRepository } from "@/lib/data/repositoryFactory";
import { idHandler } from "@/lib/utils/idHandler";
import { ONE_MINUTE_LEFT_MESSAGE } from "@/lib/utils/messageUtils";
import { unformatTime } from "@/lib/utils/unformatTime";
import {
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
import type { ChatMetadata, Interview, NewChatMetadata, NewInterview, User } from "~/db/schema";
import { logger } from "~/lib/logger";

interface VoiceStatus {
  value: "disconnected" | "connecting" | "connected";
  reason?: string;
  sendUserInput: (message: string) => void;
  messages: any[];
}

interface VoiceMessage {
  type: string;
  message: {
    content: string;
    prosody: {
      scores: {
        [key: string]: number;
      };
    };
  };
}

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
    setConnectionStatus,
    markWrapUpSent,
    setMessages,
  } = useActiveInterviewActions();

  const {
    disconnect,
    status,
    callDurationTimestamp: voiceTimestamp,
    sendUserInput,
    sendAssistantInput,
    messages,
    sendSessionSettings,
    chatMetadata,
  } = useVoice();

  const { mutate: createChatMetadata } = useMutation({
    mutationFn: async (metadata: NewChatMetadata) => {
      const chatMetadataRepo = await getRepository<ChatMetadata>("chat-metadata");
      return await chatMetadataRepo.create({
        ...metadata,
        interviewId: idHandler.decode(params.interviewId as string),
        createdAt: new Date(),
        updatedAt: new Date(),
        customSessionId: metadata.customSessionId || null,
        requestId: metadata.requestId || null,
      });
    },
    onSuccess: () => {
      // Request audio reconstruction after metadata is created
      requestAudioReconstruction();
    },
  });

  // Update store with voice state
  useEffect(() => {
    setConnectionStatus(status.value === "connected");

    if (voiceTimestamp) {
      setCallDurationTimestamp(voiceTimestamp);
    }

    if (messages && messages.length > 0) {
      // Convert the voice messages to the format expected by our store
      const storeCompatibleMessages = messages
        .filter((m: any) => m.type === "user_message" || m.type === "assistant_message")
        .map((m: any) => ({
          role: m.type === "user_message" ? "user" : "assistant",
          content: m.message?.content || "",
          prosody: m.type === "user_message" ? m.models?.prosody?.scores : undefined,
        }));

      setMessages(storeCompatibleMessages);
    }
  }, [
    status.value,
    voiceTimestamp,
    messages,
    setConnectionStatus,
    setCallDurationTimestamp,
    setMessages,
  ]);

  // End of interview mutation
  const { mutate: updateInterview } = useMutation({
    mutationFn: async (interview: Partial<NewInterview>) => {
      const interviewRepo = await getRepository<Interview>("interviews");
      return await interviewRepo.update(params.interviewId as string, interview);
    },
    onSuccess: () => {
      if (chatMetadata) {
        createChatMetadata({
          ...chatMetadata,
          chatGroupId: chatMetadata.chatGroupId || "",
          chatId: chatMetadata.chatId || "",
          interviewId: Number.parseInt(params.interviewId as string),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      sendAssistantInput("hang_up");
      disconnect();
      queryClient.invalidateQueries({
        queryKey: ["interview", params.interviewId],
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
      toast.error("Error updating interview. Please try again.");
      if (!interviewEnded) {
        setInterviewEnded(true);
      }

      if (chatMetadata) {
        createChatMetadata({
          ...chatMetadata,
          chatGroupId: chatMetadata.chatGroupId || "",
          chatId: chatMetadata.chatId || "",
          interviewId: Number.parseInt(params.interviewId as string),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    },
  });

  // Audio reconstruction mutation
  const { mutate: requestAudioReconstruction } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/interviews/${params.interviewId}/audio-reconstruction`, {
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
        { interviewId: params.interviewId, reconstructionId: data.data.reconstruction.id },
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
  const partialTranscriptMutation = useMutation({
    mutationFn: async (interview: Partial<NewInterview>) => {
      const interviewRepo = await getRepository<Interview>("interviews");
      return await interviewRepo.update(params.interviewId as string, interview);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["interview", params.interviewId],
      });
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

        if (chatMetadata) {
          createChatMetadata({
            ...chatMetadata,
            chatGroupId: chatMetadata.chatGroupId || "",
            chatId: chatMetadata.chatId || "",
            interviewId: Number.parseInt(params.interviewId as string),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      console.error("Error decrementing minutes:", error);
      toast.error("Failed to update remaining minutes");

      if (chatMetadata) {
        createChatMetadata({
          ...chatMetadata,
          chatGroupId: chatMetadata.chatGroupId || "",
          chatId: chatMetadata.chatId || "",
          interviewId: Number.parseInt(params.interviewId as string),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
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

  const handleUpdateInterview = useCallback(
    (data: Partial<NewInterview>) => {
      updateInterview(data);
    },
    [updateInterview]
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
      handleUpdateInterview({
        actualTime: Math.floor(elapsedTime / 60),
        transcript: JSON.stringify(
          messages
            .filter((m) => m.type === "user_message" || m.type === "assistant_message")
            .map((m: any) => ({
              role: m.type === "user_message" ? "user" : "assistant",
              content: m.message?.content || "",
              prosody: m.type === "user_message" ? m.models?.prosody?.scores : undefined,
            }))
        ),
      });
    }
  }, [
    status.value,
    callDurationTimestamp,
    totalTime,
    wrapUpSent,
    interviewEnded,
    messages,
    handleSendUserInput,
    handleUpdateInterview,
    markWrapUpSent,
    sendSessionSettings,
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

        partialTranscriptMutation.mutate({
          actualTime: Math.floor(currentTime / 60),
          transcript: JSON.stringify(
            messages
              .filter((m) => m.type === "user_message" || m.type === "assistant_message")
              .map((m: any) => ({
                role: m.type === "user_message" ? "user" : "assistant",
                content: m.message?.content || "",
                prosody: m.type === "user_message" ? m.models?.prosody?.scores : undefined,
              }))
          ),
        });
      }
    }
  }, [status.value, callDurationTimestamp, messages, partialTranscriptMutation, decrementMutation]);

  return null; // Controller component doesn't render anything
}
