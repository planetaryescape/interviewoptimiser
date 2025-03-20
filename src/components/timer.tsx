"use client";

import { getRepository } from "@/lib/data/repositoryFactory";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { User } from "~/db/schema";

export function Timer({
  isInterviewStarted,
  totalTime,
  onOutOfMinutes,
}: {
  isInterviewStarted: boolean;
  totalTime: number;
  onOutOfMinutes: () => void;
}) {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerCanvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const lastDecrementTimeRef = useRef<number>(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isInterviewStarted) {
      startTimeRef.current = Date.now();
    }
  }, [isInterviewStarted]);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const drawTimer = useCallback(() => {
    if (!timerCanvasRef.current) return;

    const canvas = timerCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 10;
    ctx.stroke();

    // Draw progress
    const progress = (elapsedTime || 0) / totalTime;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + progress * 2 * Math.PI;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = "#3b82f6";
    ctx.stroke();

    // Draw time text
    ctx.font = "bold 24px Inter";
    ctx.fillStyle = "#3b82f6";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(formatTime(elapsedTime || totalTime), centerX, centerY);
  }, [elapsedTime, totalTime, formatTime]);

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
  }, [drawTimer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInterviewStarted) {
      interval = setInterval(() => {
        const newElapsedTime = totalTime - Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (newElapsedTime <= 0) {
          clearInterval(interval);
          onOutOfMinutes();
          return;
        }
        setElapsedTime(newElapsedTime);
        drawTimer();
        if (newElapsedTime % 60 === 0) {
          decrementMutation.mutate();
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInterviewStarted, totalTime, drawTimer, decrementMutation, onOutOfMinutes]);

  return (
    <canvas ref={timerCanvasRef} width={120} height={120} className="shadow-lg rounded-full" />
  );
}
