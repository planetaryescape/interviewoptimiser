"use client";

import { cn } from "@/lib/utils";
import { useActiveInterviewIsConnected } from "@/stores/useActiveInterviewStore";

export function ConnectionStatus() {
  const isConnected = useActiveInterviewIsConnected();

  return (
    <div
      className={cn(
        "px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors",
        isConnected
          ? "bg-green-500/10 text-green-500 border border-green-500/20"
          : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          isConnected ? "bg-green-500" : "bg-yellow-500",
          isConnected ? "animate-pulse" : ""
        )}
      />
      {isConnected ? "Live" : "Ready"}
    </div>
  );
}
