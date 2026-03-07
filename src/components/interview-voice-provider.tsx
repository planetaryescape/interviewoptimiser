"use client";

import { VoiceProvider, useVoice } from "@humeai/voice-react";
import { type ReactNode, useEffect, useRef } from "react";
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
// Tracks which interview has attempted connection to allow new connections on navigation
let hasGlobalConnectionAttempt = false;
let lastConnectionInterviewId: string | null | undefined = null;

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
  interviewId,
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
  interviewId?: string | null;
  children: ReactNode;
}) {
  const { connect, status, sendSessionSettings } = useVoice();
  const sessionSettingsSentRef = useRef(false);

  // Send session settings after connection opens (not in URL to avoid length limits)
  useEffect(() => {
    if (
      status.value === "connected" &&
      !sessionSettingsSentRef.current &&
      sessionSettings?.systemPrompt
    ) {
      sessionSettingsSentRef.current = true;
      logger.info("Sending session settings over WebSocket");
      sendSessionSettings({
        systemPrompt: sessionSettings.systemPrompt,
        ...(sessionSettings.context && { context: sessionSettings.context }),
      });
    }
  }, [status.value, sessionSettings, sendSessionSettings]);

  useEffect(() => {
    // Reset flag if navigating to a different interview
    if (lastConnectionInterviewId !== interviewId) {
      logger.info(
        { previousId: lastConnectionInterviewId, currentId: interviewId },
        "Interview ID changed, resetting connection flag"
      );
      hasGlobalConnectionAttempt = false;
      lastConnectionInterviewId = interviewId;
      sessionSettingsSentRef.current = false;
    }

    // Only attempt connection once globally (survives strict mode remounts for same interview)
    if (hasGlobalConnectionAttempt) {
      logger.debug("Connection already attempted for this interview, skipping");
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

    // Delay connection slightly to survive React Strict Mode double-mount.
    // Without this, the first mount starts a WebSocket that gets canceled by
    // cleanup, and the second mount sees hasGlobalConnectionAttempt=true and skips.
    const connectTimer = setTimeout(() => {
      // Connect WITHOUT sessionSettings to avoid URL length limits.
      // Session settings are sent as a WebSocket message after connection opens.
      connect({
        auth: authConfig,
        configId,
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
    }, 100);

    return () => {
      clearTimeout(connectTimer);
      // If canceled before connect fires, allow retry
      hasGlobalConnectionAttempt = false;
    };
  }, [connect, authConfig, configId, sessionSettings, status, interviewStateMachine, interviewId]);

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
        interviewId={interviewId}
      >
        {children}
      </InterviewVoiceConnector>
    </VoiceProvider>
  );
}
