"use client";

import { InterviewVoiceProvider } from "@/components/interview-voice-provider";
import { InterviewOverlays } from "@/components/interview/interview-overlays";
import type { Messages } from "@/components/messages";
import * as React from "react";
import type { ComponentRef } from "react";
import { useInterviewState } from "~/lib/hooks/use-interview-state";
import { useVoiceConfiguration } from "~/lib/hooks/use-voice-configuration";
import { ErrorDialog } from "./error-dialog";
import { InterviewContent } from "./interview-content";
import { InterviewHeader } from "./interview-header";
import { useInterviewLogic } from "./use-interview-logic";
import { VoiceConfigProvider } from "./voice-config-context";

interface InterviewContainerProps {
  jobId: string;
  accessToken: string;
  interviewId: string;
}

export const InterviewContainer = React.memo(function InterviewContainer({
  jobId,
  accessToken,
  interviewId,
}: InterviewContainerProps) {
  const timeout = React.useRef<number | null>(null);
  const messagesRef = React.useRef<ComponentRef<typeof Messages> | null>(null);
  const configId = process.env.NEXT_PUBLIC_HUME_CONFIG_ID;
  const [forceSave, setForceSave] = React.useState<(() => Promise<void>) | undefined>(undefined);

  const {
    systemPrompt,
    interview,
    isLoading,
    isInterviewTooShort,
    isGenerateReportErrorDialogOpen,
    setIsGenerateReportErrorDialogOpen,
    handleRetryGenerateReport,
    handleCancelGenerateReport,
    job,
  } = useInterviewLogic({ jobId, interviewId });

  // Interview state machine - pass userId for better error logging
  const userId = job?.data?.userId?.toString();
  const interviewStateMachine = useInterviewState(interviewId, userId);

  // Voice configuration
  const voiceConfig = useVoiceConfiguration({
    accessToken,
    systemPrompt,
    interview,
  });

  // Callback to receive forceSave from InterviewController
  const handleForceSaveReady = React.useCallback((fn: () => Promise<void>) => {
    setForceSave(() => fn);
  }, []);

  const handleMessage = React.useCallback(() => {
    if (timeout.current) {
      window.clearTimeout(timeout.current);
    }

    timeout.current = window.setTimeout(() => {
      if (messagesRef.current) {
        const scrollHeight = (messagesRef.current as Element).scrollHeight;

        (messagesRef.current as Element).scrollTo({
          top: scrollHeight,
          behavior: "smooth",
        });
      }
    }, 200);
  }, []);

  if (isLoading || !voiceConfig.isConfigured) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading interview...</div>
      </div>
    );
  }

  return (
    <div className="relative grid grid-rows-[1fr_auto] mx-auto w-full overflow-auto h-full">
      <VoiceConfigProvider
        accessToken={accessToken}
        configId={configId}
        systemPrompt={systemPrompt}
        interview={interview}
      >
        <InterviewVoiceProvider
          authConfig={voiceConfig.authConfig}
          configId={voiceConfig.configId}
          sessionSettings={voiceConfig.sessionSettings}
          interviewStateMachine={interviewStateMachine}
          interviewId={interviewId}
          userId={userId}
          forceSave={forceSave}
        >
          <InterviewHeader />
          <InterviewContent
            messagesRef={messagesRef}
            isInterviewTooShort={isInterviewTooShort}
            jobId={jobId}
            interviewId={interviewId}
            interviewStateMachine={interviewStateMachine}
            onForceSaveReady={handleForceSaveReady}
          />
          <ErrorDialog
            isOpen={isGenerateReportErrorDialogOpen}
            onOpenChange={setIsGenerateReportErrorDialogOpen}
            onRetry={handleRetryGenerateReport}
            onCancel={handleCancelGenerateReport}
          />
          <InterviewOverlays
            state={interviewStateMachine.state}
            isComplete={interviewStateMachine.state === "completed"}
            error={interviewStateMachine.error}
            canRetry={interviewStateMachine.canRetry}
            onRetry={() => {
              interviewStateMachine.send({ type: "RESET" });
              window.location.reload();
            }}
            disconnectInitiator={interviewStateMachine.disconnectInitiator}
          />
        </InterviewVoiceProvider>
      </VoiceConfigProvider>
    </div>
  );
});
