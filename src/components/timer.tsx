"use client";

import { User } from "@/db/schema";
import { getRepository } from "@/lib/data/repositoryFactory";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { toast } from "sonner";

export function Timer({
  isInterviewStarted,
  elapsedTime,
  setElapsedTime,
  totalTime,
  onOutOfMinutes,
}: {
  isInterviewStarted: boolean;
  elapsedTime: number;
  setElapsedTime: Dispatch<SetStateAction<number>>;
  totalTime: number;
  onOutOfMinutes: () => void;
}) {
  const timerCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastDecrementTimeRef = useRef<number>(0);
  const queryClient = useQueryClient();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const drawTimer = useCallback(() => {
    if (!timerCanvasRef.current) return;

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

    // Draw timer arc
    const progress = elapsedTime / totalTime;
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
    ctx.fillText(formatTime(elapsedTime || totalTime), centerX, centerY);
  }, [elapsedTime, totalTime]);

  const decrementMutation = useMutation({
    mutationFn: async () => {
      const repository = await getRepository<User>("users");
      const response = await repository.update("minutes/decrement", {});
      return response;
    },
    onSuccess: (updatedUser) => {
      if (updatedUser && updatedUser.data.minutes <= 0) {
        onOutOfMinutes();
        toast.error("You've run out of minutes. The interview will stop now.");
      }
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      console.error("Error decrementing minutes:", error);
      toast.error("Failed to update remaining minutes");
    },
  });

  useEffect(() => {
    drawTimer();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInterviewStarted) {
      interval = setInterval(() => {
        setElapsedTime((prevTime) => {
          const newTime = prevTime + 1;

          // Check if a minute has passed since the last decrement
          if (
            Math.floor(newTime / 60) >
            Math.floor(lastDecrementTimeRef.current / 60)
          ) {
            decrementMutation.mutate();
            lastDecrementTimeRef.current = newTime;
          }

          if (newTime >= totalTime) {
            clearInterval(interval);
            return totalTime;
          }
          return newTime;
        });
        drawTimer();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [
    isInterviewStarted,
    totalTime,
    drawTimer,
    setElapsedTime,
    onOutOfMinutes,
    decrementMutation,
  ]);

  return (
    <canvas
      ref={timerCanvasRef}
      width={120}
      height={120}
      className="shadow-lg rounded-full"
    />
  );
}
