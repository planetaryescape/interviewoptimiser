"use client";

import { getRepository } from "@/lib/data/repositoryFactory";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils/formatTime";
import { ONE_MINUTE_LEFT_MESSAGE } from "@/lib/utils/messageUtils";
import { unformatTime } from "@/lib/utils/unformatTime";
import { useVoice } from "@humeai/voice-react";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { Interview, NewInterview, User } from "~/db/schema";

interface Message {
  role: string;
  content: string;
}

interface VoiceStatus {
  value: "disconnected" | "connecting" | "connected";
  reason?: string;
  sendUserInput: (message: string) => void;
  messages: Message[];
}

export function TimerHume({
  totalTime,
  setInterviewEnded,
}: {
  totalTime: number;
  setInterviewEnded: (interviewEnded: boolean) => void;
}) {
  const timerCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastDecrementTimeRef = useRef<number>(0);
  const queryClient = useQueryClient();
  const wrapUpRef = useRef<boolean>(false);
  const timeUpRef = useRef<boolean>(false);
  const params = useParams();

  const { disconnect, status, callDurationTimestamp, sendUserInput, sendAssistantInput, messages } =
    useVoice();

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
      setInterviewEnded(true);
    },
    onError: (error) => {
      sendAssistantInput("hang_up");
      disconnect();
      Sentry.withScope((scope) => {
        scope.setContext("params", params);
        Sentry.captureException(error);
      });
      toast.error("Error updating interview. Please try again.");
      setInterviewEnded(true);
    },
  });

  const handleSendUserInput = useCallback(
    (message: string) => {
      if (status.value === "connected" && "sendUserInput" in status) {
        (status as VoiceStatus).sendUserInput(message);
      }
    },
    [status]
  );

  const handleUpdateInterview = useCallback(
    (data: Partial<NewInterview>) => {
      updateInterview(data);
    },
    [updateInterview]
  );

  useEffect(() => {
    if (status.value !== "connected") return;
    if (!callDurationTimestamp) return;

    if (unformatTime(callDurationTimestamp) === totalTime - 60 && !wrapUpRef.current) {
      handleSendUserInput(ONE_MINUTE_LEFT_MESSAGE);
      wrapUpRef.current = true;
    }

    if (unformatTime(callDurationTimestamp) === totalTime && !timeUpRef.current) {
      handleUpdateInterview({
        actualTime: Math.floor(unformatTime(callDurationTimestamp) / 60),
        transcript: JSON.stringify(
          (status as VoiceStatus).messages
            .filter((m: Message) => m.role === "assistant")
            .map((m: Message) => m.content)
        ),
      });
      timeUpRef.current = true;
    }
  }, [
    status.value,
    callDurationTimestamp,
    totalTime,
    handleSendUserInput,
    handleUpdateInterview,
    status,
  ]);

  useEffect(() => {
    if (!timerCanvasRef.current) return;
    if (!callDurationTimestamp) return;

    const ctx = timerCanvasRef.current.getContext("2d");
    if (!ctx) return;

    const WIDTH = timerCanvasRef.current.width;
    const HEIGHT = timerCanvasRef.current.height;
    const centerX = WIDTH / 2;
    const centerY = HEIGHT / 2;
    const radius = Math.min(WIDTH, HEIGHT) / 2 - 10;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "#f0f0f0";
    ctx.fill();

    // Calculate remaining time
    const elapsedTime = unformatTime(callDurationTimestamp);
    const remainingTime = Math.max(0, totalTime - elapsedTime);
    const progress = 1 - remainingTime / totalTime;

    // Draw timer arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + progress * 2 * Math.PI);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = "#3B82F6";
    ctx.fill();

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 20, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();

    // Draw time text
    ctx.font = "bold 20px Inter, sans-serif";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(formatTime(remainingTime), centerX, centerY);
  }, [totalTime, callDurationTimestamp]);

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

  useEffect(() => {
    if (status.value === "connected") {
      if (!callDurationTimestamp) return;

      const currentTime = unformatTime(callDurationTimestamp);
      if (Math.floor(currentTime / 60) > Math.floor(lastDecrementTimeRef.current / 60)) {
        lastDecrementTimeRef.current = currentTime;

        partialTranscriptMutation.mutate({
          actualTime: Math.floor(unformatTime(callDurationTimestamp) / 60),
          transcript: JSON.stringify(
            (status as VoiceStatus).messages
              .filter((m: Message) => m.role === "assistant")
              .map((m: Message) => m.content)
          ),
        });
      }
    }
  }, [status.value, callDurationTimestamp, status, partialTranscriptMutation]);

  return (
    <div className="absolute top-4 right-4 flex items-center gap-4 z-50">
      <div
        className={cn(
          "px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors",
          status.value === "connected"
            ? "bg-green-500/10 text-green-500 border border-green-500/20"
            : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
        )}
      >
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            status.value === "connected" ? "bg-green-500" : "bg-yellow-500",
            status.value === "connected" ? "animate-pulse" : ""
          )}
        />
        {status.value === "connected" ? "Live" : "Ready"}
      </div>

      {/* Timer Display */}
      <div className="relative flex items-center justify-center">
        <canvas
          ref={timerCanvasRef}
          width={100}
          height={100}
          className={cn(
            "transition-opacity duration-300",
            status.value === "connected" ? "opacity-100" : "opacity-50"
          )}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xs text-muted-foreground font-medium mb-1">Time Left</div>
            <div className="text-lg font-bold font-mono">
              {callDurationTimestamp
                ? formatTime(Math.max(0, totalTime - unformatTime(callDurationTimestamp)))
                : "--:--"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
