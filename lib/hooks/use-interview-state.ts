import { useCallback, useReducer, useRef } from "react";
import { clientLogger } from "../pino-client-logger";

export type InterviewState =
  | "idle"
  | "connecting"
  | "connected"
  | "in_progress"
  | "disconnecting"
  | "ai_completing"
  | "user_completing"
  | "completed"
  | "error";

export type InterviewEvent =
  | { type: "CONNECT" }
  | { type: "CONNECTED" }
  | { type: "START_INTERVIEW" }
  | { type: "USER_DISCONNECT" }
  | { type: "AI_DISCONNECT" }
  | { type: "COMPLETION_SUCCESS" }
  | { type: "COMPLETION_ERROR"; error: string }
  | { type: "CONNECTION_ERROR"; error: string }
  | { type: "RESET" };

interface InterviewStateContext {
  state: InterviewState;
  error?: string;
  isProcessing: boolean;
  canDisconnect: boolean;
  canRetry: boolean;
  disconnectInitiator?: "user" | "ai";
}

const initialState: InterviewStateContext = {
  state: "idle",
  isProcessing: false,
  canDisconnect: false,
  canRetry: false,
};

function interviewReducer(
  context: InterviewStateContext,
  event: InterviewEvent
): InterviewStateContext {
  const _logger = clientLogger.child({
    currentState: context.state,
    event: event.type,
  });

  switch (context.state) {
    case "idle":
      if (event.type === "CONNECT") {
        return { ...context, state: "connecting", isProcessing: true };
      }
      break;

    case "connecting":
      if (event.type === "CONNECTED") {
        return {
          ...context,
          state: "connected",
          isProcessing: false,
          canDisconnect: true,
        };
      }
      if (event.type === "CONNECTION_ERROR") {
        return {
          ...context,
          state: "error",
          error: event.error,
          isProcessing: false,
          canRetry: true,
        };
      }
      break;

    case "connected":
      if (event.type === "START_INTERVIEW") {
        return { ...context, state: "in_progress" };
      }
      if (event.type === "USER_DISCONNECT") {
        return {
          ...context,
          state: "user_completing",
          disconnectInitiator: "user",
          isProcessing: true,
          canDisconnect: false,
        };
      }
      break;

    case "in_progress":
      if (event.type === "USER_DISCONNECT") {
        return {
          ...context,
          state: "user_completing",
          disconnectInitiator: "user",
          isProcessing: true,
          canDisconnect: false,
        };
      }
      if (event.type === "AI_DISCONNECT") {
        return {
          ...context,
          state: "ai_completing",
          disconnectInitiator: "ai",
          isProcessing: true,
          canDisconnect: false,
        };
      }
      break;

    case "user_completing":
    case "ai_completing":
      if (event.type === "COMPLETION_SUCCESS") {
        return { ...context, state: "completed", isProcessing: false };
      }
      if (event.type === "COMPLETION_ERROR") {
        return {
          ...context,
          state: "error",
          error: event.error,
          isProcessing: false,
          canRetry: true,
        };
      }
      break;

    case "error":
      if (event.type === "RESET") {
        return initialState;
      }
      break;

    case "completed":
      break;
  }

  return context;
}

export type InterviewStateMachine = ReturnType<typeof useInterviewState>;

export function useInterviewState(interviewId: string | null, userId?: string) {
  const [context, dispatch] = useReducer(interviewReducer, initialState);
  const stateRef = useRef(context);
  stateRef.current = context;

  const logger = clientLogger.child({ interviewId, userId });

  const send = useCallback(
    (event: InterviewEvent) => {
      logger.debug(
        {
          event,
          currentState: stateRef.current.state,
        },
        "Dispatching interview event"
      );
      dispatch(event);
    },
    [logger]
  );

  const _checkCanDisconnect = useCallback(() => {
    return stateRef.current.canDisconnect;
  }, []);

  const _checkIsProcessing = useCallback(() => {
    return stateRef.current.isProcessing;
  }, []);

  const getDisconnectInitiator = useCallback(() => {
    return stateRef.current.disconnectInitiator;
  }, []);

  return {
    state: context.state,
    error: context.error,
    isProcessing: context.isProcessing,
    canDisconnect: context.canDisconnect,
    canRetry: context.canRetry,
    disconnectInitiator: context.disconnectInitiator,
    send,
    getDisconnectInitiator,
  };
}
