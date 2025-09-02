"use client";

import { useVoice } from "@humeai/voice-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils/formatTime";
import {
  useActiveInterviewRemainingTime,
  useActiveInterviewTotalTime,
} from "@/stores/useActiveInterviewStore";

export function TimerDisplay() {
  const timerCanvasRef = useRef<HTMLCanvasElement>(null);
  const totalTime = useActiveInterviewTotalTime();
  const remainingTime = useActiveInterviewRemainingTime();
  const { status, callDurationTimestamp } = useVoice();

  useEffect(() => {
    // Skip canvas rendering in test environment
    if (
      typeof window !== "undefined" &&
      window.document.documentElement.hasAttribute("data-vitest")
    ) {
      return;
    }

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

    // Calculate progress
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
  }, [totalTime, callDurationTimestamp, remainingTime]);

  return (
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
            {callDurationTimestamp ? formatTime(remainingTime) : formatTime(totalTime)}
          </div>
        </div>
      </div>
    </div>
  );
}
