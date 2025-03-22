"use client";

import { getRepository } from "@/lib/data/repositoryFactory";
import { ONE_MINUTE_LEFT_MESSAGE } from "@/lib/utils/messageUtils";
import { unformatTime } from "@/lib/utils/unformatTime";
import {
  useActiveInterviewActions,
  useActiveInterviewCallDuration,
  useActiveInterviewEnded,
  useActiveInterviewMessages,
  useActiveInterviewTotalTime,
  useActiveInterviewWrapUpSent,
} from "@/stores/useActiveInterviewStore";
import { useVoice } from "@humeai/voice-react";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { Interview, NewInterview, User } from "~/db/schema";

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
  const storeMessages = useActiveInterviewMessages();

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
  } = useVoice();

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
      console.log("error:", error);
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

        console.log("messages:", messages);

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
