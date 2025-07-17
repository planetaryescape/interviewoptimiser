"use client";

import { ConnectionStatus } from "@/components/interview/connection-status";
import { TimerDisplay } from "@/components/interview/timer-display";
import * as React from "react";

export const InterviewHeader = React.memo(function InterviewHeader() {
  return (
    <div className="absolute top-4 right-4 flex items-center gap-4 z-50">
      <TimerDisplay />
      <ConnectionStatus />
    </div>
  );
});
