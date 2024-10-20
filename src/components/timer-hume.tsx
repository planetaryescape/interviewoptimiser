"use client";

import { Interview, NewInterview, User } from "@/db/schema";
import { getRepository } from "@/lib/data/repositoryFactory";
import { cn } from "@/lib/utils";
import { useVoice } from "@humeai/voice-react";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

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

  const {
    disconnect,
    status,
    callDurationTimestamp,
    sendUserInput,
    sendAssistantInput,
    messages,
  } = useVoice();

  const { mutate: updateInterview } = useMutation({
    mutationFn: async (interview: Partial<NewInterview>) => {
      const interviewRepo = await getRepository<Interview>("interviews");
      return await interviewRepo.update(params.id as string, interview);
    },
    onSuccess: () => {
      sendAssistantInput("hang_up");
      disconnect();
      queryClient.invalidateQueries({ queryKey: ["interview", params.id] });
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

  // Format time - number to HH:MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Unformat time - HH:MM:SS to number
  const unformatTime = (time: string) => {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  useEffect(() => {
    if (status.value !== "connected") return;
    if (!callDurationTimestamp) return;

    if (
      unformatTime(callDurationTimestamp) === totalTime - 60 &&
      !wrapUpRef.current
    ) {
      console.log(
        "unformatTime(callDurationTimestamp):",
        unformatTime(callDurationTimestamp)
      );
      console.log("totalTime:", totalTime);
      sendUserInput(
        "<One minute left>Tell the candidate how much time is left and start wrapping up the interview and tell the candidate that a report will be generated</One minute left>"
      );
      wrapUpRef.current = true;
    }

    if (
      unformatTime(callDurationTimestamp) === totalTime &&
      !timeUpRef.current
    ) {
      updateInterview({
        transcript: JSON.stringify(
          messages
            .map((msg) => {
              if (
                msg.type === "user_message" ||
                msg.type === "assistant_message"
              ) {
                return {
                  role: msg.message.role,
                  content: msg.message.content?.replace(
                    "<One minute left>Tell the candidate how much time is left and start wrapping up the interview and tell the candidate that a report will be generated</One minute left>.",
                    ""
                  ),
                  prosody: msg.models.prosody?.scores ?? {},
                };
              }
              return null;
            })
            .filter((msg) => msg !== null)
        ),
      });

      timeUpRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callDurationTimestamp, totalTime, status.value, messages]);

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
    ctx.arc(
      centerX,
      centerY,
      radius,
      -Math.PI / 2,
      -Math.PI / 2 + progress * 2 * Math.PI
    );
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
        toast.error(
          "You've run out of minutes. The interview has been stopped."
        );
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
      return await interviewRepo.update(params.id as string, interview);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interview", params.id] });
    },
    onError: (error) => {
      console.log("error:", error);
      Sentry.withScope((scope) => {
        scope.setContext("params", params);
        Sentry.captureException(error);
      });
      toast.error("Error updating interview. Please try again.");
    },
  });

  useEffect(() => {
    if (status.value === "connected") {
      if (!callDurationTimestamp) return;
      // Check if a minute has passed since the last decrement
      if (
        Math.floor(unformatTime(callDurationTimestamp) / 60) >
        Math.floor(lastDecrementTimeRef.current / 60)
      ) {
        decrementMutation.mutate();
        lastDecrementTimeRef.current = unformatTime(callDurationTimestamp);

        partialTranscriptMutation.mutate({
          transcript: JSON.stringify(
            messages
              .map((msg) => {
                if (
                  msg.type === "user_message" ||
                  msg.type === "assistant_message"
                ) {
                  return {
                    role: msg.message.role,
                    content: msg.message.content?.replace(
                      "<One minute left>Tell the candidate how much time is left and start wrapping up the interview and tell the candidate that a report will be generated</One minute left>.",
                      ""
                    ),
                    prosody: msg.models.prosody?.scores ?? {},
                  };
                }
                return null;
              })
              .filter((msg) => msg !== null)
          ),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decrementMutation, status.value, callDurationTimestamp, messages]);

  return (
    <canvas
      ref={timerCanvasRef}
      width={120}
      height={120}
      className={cn(
        "absolute top-4 right-4 shadow-lg rounded-full",
        status.value === "connected" ? "opacity-100" : "opacity-50"
      )}
    />
  );
}
