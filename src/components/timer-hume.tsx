"use client";

import {
  useActiveInterviewActions,
  useActiveInterviewEnded,
} from "@/stores/useActiveInterviewStore";
import { useEffect, useRef } from "react";
import { ConnectionStatus } from "./interview/connection-status";
import { InterviewController } from "./interview/interview-controller";
import { TimerDisplay } from "./interview/timer-display";

export function TimerHume({
  totalTime,
}: {
  totalTime: number;
}) {
  const { setTotalTime, setInterviewEnded } = useActiveInterviewActions();
  const interviewEnded = useActiveInterviewEnded();
  const hasNotifiedParentRef = useRef(false);

  // Initialize store with props
  useEffect(() => {
    setTotalTime(totalTime);
  }, [totalTime, setTotalTime]);

  // Propagate interviewEnded state to parent only once
  useEffect(() => {
    if (interviewEnded && !hasNotifiedParentRef.current) {
      hasNotifiedParentRef.current = true;
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
