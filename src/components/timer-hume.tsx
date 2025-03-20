"use client";

import {
  useActiveInterviewActions,
  useActiveInterviewEnded,
} from "@/stores/useActiveInterviewStore";
import { useEffect } from "react";
import { ConnectionStatus } from "./interview/connection-status";
import { InterviewController } from "./interview/interview-controller";
import { TimerDisplay } from "./interview/timer-display";

export function TimerHume({
  totalTime,
  setInterviewEnded,
}: {
  totalTime: number;
  setInterviewEnded: (interviewEnded: boolean) => void;
}) {
  const { setTotalTime } = useActiveInterviewActions();
  const interviewEnded = useActiveInterviewEnded();

  // Initialize store with props
  useEffect(() => {
    setTotalTime(totalTime);
  }, [totalTime, setTotalTime]);

  // Propagate interviewEnded state to parent
  useEffect(() => {
    if (interviewEnded) {
      setInterviewEnded(true);
    }
  }, [interviewEnded, setInterviewEnded]);

  return (
    <div className="absolute top-4 right-4 flex items-center gap-4 z-50">
      <ConnectionStatus />
      <TimerDisplay />
      <InterviewController />
    </div>
  );
}
