import { toast } from "sonner";
import type { InterviewEvent } from "../hooks/use-interview-state";
import { clientLogger } from "../pino-client-logger";

interface InterviewStateMachine {
  send: (event: InterviewEvent) => void;
  state: string;
}

// Rate limiting for credit exhaustion alerts (5 minutes between alerts)
let lastCreditExhaustionAlert = 0;
const CREDIT_ALERT_COOLDOWN = 5 * 60 * 1000; // 5 minutes

export const handleVoiceMessage = (
  message: any,
  interviewStateMachine: InterviewStateMachine,
  forceSave?: () => Promise<void>
) => {
  const logger = clientLogger.child({ component: "handleVoiceMessage" });

  if (message.type === "tool_call" && message.name === "hang_up") {
    logger.info("AI is using hang_up tool");

    // Force save transcript before AI-initiated disconnect
    // This ensures no messages are lost due to debounce
    if (forceSave) {
      forceSave().catch((error) => {
        logger.error({ error }, "Failed to force save before AI disconnect");
      });
    }

    interviewStateMachine.send({ type: "AI_DISCONNECT" });
  }

  if (message.models?.prosody?.scores) {
    const topEmotions = Object.entries(message.models.prosody.scores)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([emotion, score]) => ({ emotion, score }));

    logger.debug(
      {
        messageType: message.type,
        topEmotions,
        totalEmotions: Object.keys(message.models.prosody.scores).length,
      },
      "Prosody data captured"
    );
  }
};

export const handleVoiceError = (
  error: any,
  interviewStateMachine: InterviewStateMachine,
  interviewId?: string | null,
  userId?: string
) => {
  const logger = clientLogger.child({ component: "handleVoiceError" });

  logger.error(
    {
      errorType: error.type,
      errorMessage: error.message,
      errorDetails: error,
    },
    "Voice error occurred"
  );

  // Check for credit exhaustion error
  if (error.type === "socket_error" && error.message?.includes("Exhausted credit balance")) {
    logger.error(
      {
        errorMessage: error.message,
        interviewId,
        userId,
      },
      "CRITICAL: Hume AI credits exhausted"
    );

    // Rate-limited alert: only send once per cooldown period
    const now = Date.now();
    if (now - lastCreditExhaustionAlert > CREDIT_ALERT_COOLDOWN) {
      lastCreditExhaustionAlert = now;

      // Send alert to API endpoint (fire and forget)
      fetch("/api/alerts/credit-exhaustion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          errorMessage: error.message,
          interviewId,
          userId,
        }),
      }).catch((alertError) => {
        logger.error({ error: alertError }, "Failed to send credit exhaustion alert");
      });
    } else {
      logger.warn("Credit exhaustion alert suppressed due to rate limiting");
    }

    toast.error(
      "The interview service is temporarily unavailable. Our team has been notified and is working to resolve this."
    );
    interviewStateMachine.send({
      type: "CONNECTION_ERROR",
      error: "Service temporarily unavailable",
    });
    return;
  }

  // Check for connection capacity limit error
  if (
    error.type === "socket_error" &&
    (error.message?.includes("Exceeded simultaneous connections") ||
      error.message?.includes("concurrent connection") ||
      error.message?.includes("capacity limit"))
  ) {
    logger.warn(
      {
        errorMessage: error.message,
        interviewId,
        userId,
      },
      "Connection capacity limit reached"
    );

    toast.error(
      "Our system is currently at full capacity. Please wait a few minutes and try again. Most interviews complete within 15-20 minutes.",
      { duration: 8000 }
    );
    interviewStateMachine.send({
      type: "CONNECTION_ERROR",
      error: "Capacity limit reached",
    });
    return;
  }

  // Don't show error for AI-initiated disconnect
  if (error.message?.includes("hang_up") || error.code === 1000) {
    logger.info("Suppressing error for AI hang_up");
    return;
  }

  // Check if this is a temporary issue
  const isTemporary =
    (error.type === "socket_error" && error.message?.includes("temporarily")) ||
    error.code === 1006 || // Abnormal closure
    error.code === 1013; // Try again later

  if (isTemporary) {
    logger.warn(
      {
        errorType: error.type,
        errorCode: error.code,
      },
      "Temporary connection issue detected"
    );
    toast.warning("Don't worry, we're reconnecting you now...", {
      duration: 3000,
    });
    return;
  }

  // Don't send connection error if we're already completing
  if (
    interviewStateMachine.state !== "ai_completing" &&
    interviewStateMachine.state !== "user_completing"
  ) {
    interviewStateMachine.send({
      type: "CONNECTION_ERROR",
      error: error.message || "Unknown error",
    });
  }

  // Provide specific error messages
  if (error.type === "socket_error") {
    if (error.message.includes("Socket is not open")) {
      if (
        interviewStateMachine.state === "ai_completing" ||
        interviewStateMachine.state === "user_completing"
      ) {
        logger.info("Suppressing socket error during completion");
        return;
      }
      toast.error("We've lost connection. Please refresh to continue.");
    } else {
      toast.error("We're having connection issues. Please check your internet.");
    }
  } else if (error.type === "auth_error") {
    toast.error("We need to verify your session. Please refresh the page.");
  } else {
    toast.error("We're having trouble connecting. Please check your internet connection.");
  }
};

export const handleVoiceOpen = (
  interviewStateMachine: InterviewStateMachine,
  configId?: string,
  systemPrompt?: string
) => {
  const logger = clientLogger.child({ component: "handleVoiceOpen" });

  logger.info(
    {
      configId,
      hasConfigId: !!configId,
      promptLength: systemPrompt?.length || 0,
      currentState: interviewStateMachine.state,
    },
    "WebSocket connection opened successfully"
  );

  // Send CONNECT first to transition to connecting state
  interviewStateMachine.send({ type: "CONNECT" });

  // Then send CONNECTED to transition to connected state and enable disconnect button
  interviewStateMachine.send({ type: "CONNECTED" });
};

export const handleVoiceClose = (event: any, interviewStateMachine: InterviewStateMachine) => {
  const logger = clientLogger.child({ component: "handleVoiceClose" });

  logger.info(
    {
      code: event?.code,
      reason: event?.reason,
      wasClean: event?.wasClean,
      currentState: interviewStateMachine.state,
    },
    "WebSocket connection closed"
  );

  // Normal closure (1000) is expected, anything else might be an error
  if (event?.code !== 1000 && event?.code !== undefined) {
    if (
      interviewStateMachine.state !== "ai_completing" &&
      interviewStateMachine.state !== "user_completing" &&
      interviewStateMachine.state !== "completed"
    ) {
      logger.warn(
        {
          code: event.code,
          reason: event.reason,
        },
        "Unexpected WebSocket closure"
      );
    }
  }
};
