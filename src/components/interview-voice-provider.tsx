"use client";

import { VoiceProvider, useVoice } from "@humeai/voice-react";
import { type ReactNode, useEffect } from "react";
import { clientLogger } from "~/lib/pino-client-logger";
import {
  handleVoiceClose,
  handleVoiceError,
  handleVoiceMessage,
  handleVoiceOpen,
} from "~/lib/utils/interview-handlers";
import type { InterviewStateMachine } from "../../lib/hooks/use-interview-state";

const logger = clientLogger.child({ component: "interview-voice-provider" });

// Global flag to prevent multiple connection attempts across strict mode remounts
let hasGlobalConnectionAttempt = false;

interface InterviewVoiceProviderProps {
  children: ReactNode;
  authConfig: { type: "accessToken"; value: string };
  configId: string | undefined;
  sessionSettings: {
    systemPrompt: string;
    context?: {
      text: string;
      type: "persistent";
    };
  };
  interviewStateMachine: InterviewStateMachine;
  interviewId?: string | null;
  userId?: string;
  forceSave?: () => Promise<void>;
}

// Inner component that uses the useVoice hook to connect
function InterviewVoiceConnector({
  authConfig,
  configId,
  sessionSettings,
  interviewStateMachine,
  children,
}: {
  authConfig: { type: "accessToken"; value: string };
  configId: string | undefined;
  sessionSettings: {
    systemPrompt: string;
    context?: {
      text: string;
      type: "persistent";
    };
  };
  interviewStateMachine: InterviewStateMachine;
  children: ReactNode;
}) {
  const { connect, status } = useVoice();

  useEffect(() => {
    // Only attempt connection once globally (survives strict mode remounts)
    if (hasGlobalConnectionAttempt) {
      return;
    }

    // Don't connect if already connecting or connected
    if (status.value === "connecting" || status.value === "connected") {
      return;
    }

    // Don't attempt to connect if we don't have required config
    if (!authConfig?.value || !configId || !sessionSettings?.systemPrompt) {
      return;
    }

    // Mark that we've attempted connection globally
    hasGlobalConnectionAttempt = true;

    // Connect with auth configuration
    const humeSessionSettings = {
      type: "session_settings" as const,
      systemPrompt: sessionSettings.systemPrompt,
      ...(sessionSettings.context && { context: sessionSettings.context }),
    };

    connect({
      auth: authConfig,
      configId,
      sessionSettings: humeSessionSettings,
    }).catch((error) => {
      logger.error({ error }, "Connection failed");

      // Notify state machine of connection error
      interviewStateMachine.send({
        type: "CONNECTION_ERROR",
        error: error instanceof Error ? error.message : "Connection failed",
      });

      // Reset so we can retry on error
      hasGlobalConnectionAttempt = false;
    });
  }, [connect, authConfig, configId, sessionSettings, status, interviewStateMachine]);

  return <>{children}</>;
}

export function InterviewVoiceProvider({
  children,
  authConfig,
  configId,
  sessionSettings,
  interviewStateMachine,
  interviewId,
  userId,
  forceSave,
}: InterviewVoiceProviderProps) {
  // Reset the global flag when this component unmounts completely
  // This allows the connection to work after navigating back to the interview page
  useEffect(() => {
    return () => {
      // On full unmount (not strict mode), reset the flag after a short delay
      // The delay ensures cleanup runs after strict mode double-unmount
      setTimeout(() => {
        hasGlobalConnectionAttempt = false;
      }, 100);
    };
  }, []);

  return (
    <VoiceProvider
      onMessage={(msg) => handleVoiceMessage(msg, interviewStateMachine, forceSave)}
      onError={(err) => handleVoiceError(err, interviewStateMachine, interviewId, userId)}
      onOpen={() => handleVoiceOpen(interviewStateMachine, configId, sessionSettings.systemPrompt)}
      onClose={(event) => handleVoiceClose(event, interviewStateMachine)}
    >
      <InterviewVoiceConnector
        authConfig={authConfig}
        configId={configId}
        sessionSettings={sessionSettings}
        interviewStateMachine={interviewStateMachine}
      >
        {children}
      </InterviewVoiceConnector>
    </VoiceProvider>
  );
}
