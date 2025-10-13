import { formatTranscriptToJsonString } from "@/lib/utils/messageUtils";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { InterviewStateMachine } from "~/lib/hooks/use-interview-state";
import { clientLogger } from "~/lib/pino-client-logger";

const logger = clientLogger.child({ component: "interview-completion" });

interface InterviewCompletionOptions {
  interviewId: string;
  jobId: string;
  messages: any[];
  startTime?: Date;
  interviewStateMachine: InterviewStateMachine;
  router: AppRouterInstance;
  saveTranscriptFn: (messages: any[]) => Promise<void>;
}

/**
 * Handle interview completion and navigation
 */
export async function handleInterviewCompletion({
  interviewId,
  jobId,
  messages,
  startTime,
  interviewStateMachine,
  router,
  saveTranscriptFn,
}: InterviewCompletionOptions) {
  // Update state machine
  interviewStateMachine.send({ type: "USER_DISCONNECT" });

  const duration = startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : 0;

  // Save final transcript (with retry built in)
  try {
    await saveTranscriptFn(messages);
  } catch (error) {
    // If final save fails, data is in localStorage - user can refresh
    logger.error({ error }, "Failed to save final transcript");
  }

  // Navigate to completion page or report
  router.push(`/dashboard/jobs/${jobId}/interviews/${interviewId}`);
}

/**
 * Create mutation function for starting an interview
 */
export function createInterviewStartMutation(interviewId: string, jobId: string) {
  return async () => {
    const response = await fetch(`/api/interviews/${interviewId}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });

    if (!response.ok) {
      throw new Error("Failed to start interview");
    }

    return response.json();
  };
}
