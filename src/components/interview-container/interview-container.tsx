"use client";

import type { Messages } from "@/components/messages";
import { VoiceProvider } from "@humeai/voice-react";
import type { ComponentRef } from "react";
import * as React from "react";
import { ErrorDialog } from "./error-dialog";
import { InterviewContent } from "./interview-content";
import { InterviewHeader } from "./interview-header";
import { useInterviewLogic } from "./use-interview-logic";
import { createSessionContext } from "./voice-provider-config";

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

  const {
    systemPrompt,
    interview,
    isLoading,
    isInterviewTooShort,
    isGenerateReportErrorDialogOpen,
    setIsGenerateReportErrorDialogOpen,
    handleRetryGenerateReport,
    handleCancelGenerateReport,
  } = useInterviewLogic({ jobId, interviewId });

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

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading interview...</div>
      </div>
    );
  }

  return (
    <div className="relative grid grid-rows-[1fr_auto] mx-auto w-full overflow-auto h-full">
      <VoiceProvider
        auth={{ type: "accessToken", value: accessToken }}
        configId={configId}
        sessionSettings={{
          type: "session_settings",
          systemPrompt,
          context: {
            text: createSessionContext(interview as any),
            type: "persistent",
          },
        }}
        onMessage={handleMessage}
        resumedChatGroupId={interview?.data.chatGroupId}
      >
        <InterviewHeader />
        <InterviewContent
          messagesRef={messagesRef}
          isInterviewTooShort={isInterviewTooShort}
          jobId={jobId}
        />
        <ErrorDialog
          isOpen={isGenerateReportErrorDialogOpen}
          onOpenChange={setIsGenerateReportErrorDialogOpen}
          onRetry={handleRetryGenerateReport}
          onCancel={handleCancelGenerateReport}
        />
      </VoiceProvider>
    </div>
  );
});
