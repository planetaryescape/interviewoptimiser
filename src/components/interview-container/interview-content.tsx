"use client";

import { Controls } from "@/components/controls";
import { GeneratingReportTakeover } from "@/components/generating-report-takeover";
import { InterviewController } from "@/components/interview/interview-controller";
import { Messages } from "@/components/messages";
import { ShortInterviewTakeover } from "@/components/short-interview-takeover";
import { useActiveInterviewShowTakeover } from "@/stores/useActiveInterviewStore";
import { AnimatePresence } from "framer-motion";
import type { ComponentRef } from "react";
import * as React from "react";

interface InterviewContentProps {
  messagesRef: React.RefObject<ComponentRef<typeof Messages> | null>;
  isInterviewTooShort: boolean;
  jobId: string;
  interviewId: string;
  interviewStateMachine: any; // Type from use-interview-state
  onForceSaveReady?: (forceSave: () => Promise<void>) => void;
}

export const InterviewContent = React.memo(function InterviewContent({
  messagesRef,
  isInterviewTooShort,
  jobId,
  interviewId,
  interviewStateMachine,
  onForceSaveReady,
}: InterviewContentProps) {
  const showTakeover = useActiveInterviewShowTakeover();

  return (
    <>
      <Messages ref={messagesRef} />
      <InterviewController
        interviewId={interviewId}
        jobId={jobId}
        interviewStateMachine={interviewStateMachine}
        onForceSaveReady={onForceSaveReady}
      />
      <Controls interviewStateMachine={interviewStateMachine} />

      <AnimatePresence>
        {showTakeover &&
          (isInterviewTooShort ? (
            <ShortInterviewTakeover jobId={jobId} />
          ) : (
            <GeneratingReportTakeover />
          ))}
      </AnimatePresence>
    </>
  );
});
