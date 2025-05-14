"use client";

import useCustomisedSystemPrompt from "@/hooks/useCustomisedSystemPrompt";
import { idHandler } from "@/lib/utils/idHandler";
import {
  useActiveInterview,
  useActiveInterviewActions,
  useActiveInterviewEnded,
  useActiveInterviewShowTakeover,
} from "@/stores/useActiveInterviewStore";
import { formatInterviewType } from "@/utils/conversation_config";
import { VoiceProvider } from "@humeai/voice-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { type ComponentRef, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Controls } from "./controls";
import { GeneratingReportTakeover } from "./generating-report-takeover";
import { ConnectionStatus } from "./interview/connection-status";
import { InterviewController } from "./interview/interview-controller";
import { TimerDisplay } from "./interview/timer-display";
import { Messages } from "./messages";

export function InterviewContainer({
  jobId,
  accessToken,
  interviewId,
}: {
  jobId: string;
  accessToken: string;
  interviewId: string;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const interviewEnded = useActiveInterviewEnded();
  const {
    setActiveInterview: setActiveInterviewChat,
    resetState,
    setShowTakeover,
    setTotalTime,
  } = useActiveInterviewActions();
  const showTakeover = useActiveInterviewShowTakeover();
  const activeInterview = useActiveInterview();
  const timeout = useRef<number | null>(null);
  const messagesRef = useRef<ComponentRef<typeof Messages> | null>(null);
  const hasGeneratedReportRef = useRef(false);
  const interviewDataLoaded = useRef(false);
  const configId = process.env.NEXT_PUBLIC_HUME_CONFIG_ID;

  const { systemPrompt, interview, isLoading } = useCustomisedSystemPrompt({
    jobId,
    interviewId,
  });

  useEffect(() => {
    if (interview && !isLoading && !interviewDataLoaded.current) {
      setActiveInterviewChat({
        id: interview.data.id,
        createdAt: interview.data.createdAt,
        updatedAt: interview.data.updatedAt,
        actualTime: interview.data.actualTime,
        duration: interview.data.duration,
        type: interview.data.type,
        keyQuestions: interview.data.keyQuestions,
        jobId,
        customSessionId: interview.data.customSessionId,
        transcript: interview.data.transcript,
        chatGroupId: interview.data.chatGroupId,
        humeChatId: interview.data.humeChatId,
        requestId: interview.data.requestId,
      });
      interviewDataLoaded.current = true;
    }
  }, [interview, setActiveInterviewChat, isLoading, jobId]);

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const body = {
        jobId,
        interviewId: idHandler.encode(activeInterview?.id ?? 0),
      };

      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["job", jobId],
      });
      setShowTakeover(false);
      resetState();
      router.push(`/dashboard/jobs/${jobId}/reports`);
    },
    onError: (error) => {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report. Please try again.");
      setShowTakeover(false);

      queryClient.invalidateQueries({
        queryKey: ["job", jobId],
      });
      router.push(`/dashboard/jobs/${jobId}/reports`);
    },
  });

  useEffect(() => {
    if (interviewEnded && !hasGeneratedReportRef.current) {
      hasGeneratedReportRef.current = true;
      setShowTakeover(true);
      generateReportMutation.mutate();
    }
  }, [interviewEnded, generateReportMutation, setShowTakeover]);

  useEffect(() => {
    if (interview?.data.duration) {
      setTotalTime(interview.data.duration * 60);
    }
  }, [interview, setTotalTime]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading interview...</div>
      </div>
    );
  }

  return (
    <div className={"relative grid grid-rows-[1fr_auto] mx-auto w-full overflow-auto h-full"}>
      <VoiceProvider
        auth={{ type: "accessToken", value: accessToken }}
        configId={configId}
        sessionSettings={{
          type: "session_settings",
          systemPrompt,
          context: {
            text: `You are an AI interviewer called Cora, the lead interviewer at Interview Optimiser. You are conducting a ${
              interview?.data?.duration
            } minute ${formatInterviewType(
              interview?.data?.type || "behavioral"
            )} mock interview with ${
              interview?.data?.job.candidateDetails.name
            } to help them prepare for a ${interview?.data?.job.jobDescription.role} job at ${
              interview?.data?.job.jobDescription.company
            }. Your goal is to ask relevant, insightful questions based on the candidate data and job role information, focusing on ${formatInterviewType(
              interview?.data?.type || "behavioral"
            )} questions.

            IMPORTANT: It is absolutely CRUCIAL that you respect the interview type and ask questions in line with the type of interview.

            Do not interrupt the candidate; always let them finish their thoughts. If the candidate's response seems incomplete, use affirming interjections like "uh-huh" to encourage them to continue. Use positive reinforcement and adjust the difficulty of questions based on the candidate's performance, allowing them to expand and providing feedback when necessary.

            ${
              interview?.data?.keyQuestions?.length
                ? `IMPORTANT: These are the ${
                    interview?.data?.keyQuestions?.length
                  } key questions that MUST be asked during the interview. They are the HIGHEST PRIORITY questions and should be asked before exploring other topics. These questions have been specifically generated for this role and are crucial for assessing the candidate's suitability:

            ${interview?.data?.keyQuestions
              .map((q: string, i: number) => `${i + 1}. ${q}`)
              .join("\n")}

            IMPORTANT GUIDELINES FOR QUESTIONS:
            1. Ask ALL of these key questions during the interview - they are mandatory and essential for the evaluation report
            2. Space them naturally throughout the interview, but ensure they are all covered before exploring less critical topics
            3. Ask follow-up questions based on the candidate's responses to these key questions
            4. Only move to other questions when:
               - The candidate's response to a key question naturally leads to a relevant follow-up topic
               - All key questions have been thoroughly covered
            5. Return to any key questions that weren't fully answered before concluding the interview`
                : ""
            }`,
            type: "persistent",
          },
        }}
        onMessage={() => {
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
        }}
        resumedChatGroupId={interview?.data.chatGroupId}
      >
        <div className="absolute top-4 right-4 flex items-center gap-4 z-50">
          <TimerDisplay />
          <ConnectionStatus />
        </div>
        <Messages ref={messagesRef} />
        <InterviewController />
        <Controls />

        <AnimatePresence>{showTakeover && <GeneratingReportTakeover />}</AnimatePresence>
      </VoiceProvider>
    </div>
  );
}
