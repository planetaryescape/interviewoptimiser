"use client";

import type { Entity } from "@/lib/utils/formatEntity";
import {
  useActiveInterviewActions,
  useActiveInterviewEnded,
} from "@/stores/useActiveInterviewStore";
import { createInterviewInstructions } from "@/utils/conversation_config";
import { VoiceProvider } from "@humeai/voice-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { type ComponentRef, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { z } from "zod";
import type { InferResultType } from "~/db/helpers";
import type { CandidateDetails } from "~/lib/ai/extract-candidate-details";
import type { StructuredJobDescriptionSchema } from "~/lib/ai/extract-job-description";
import { Controls } from "./controls";
import { GeneratingReportTakeover } from "./generating-report-takeover";
import { Messages } from "./messages";
import MessagesPlaceholder from "./messages-placeholder";
import { TimerHume } from "./timer-hume";

type InterviewWithCandidateDetailsAndJobDescription = InferResultType<
  "interviews",
  {
    candidateDetails: true;
    jobDescription: true;
  }
>;

export default function ClientComponent({
  id,
  accessToken,
}: {
  id: string;
  accessToken: string;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const interviewEnded = useActiveInterviewEnded();
  const { setInterviewEnded } = useActiveInterviewActions();

  const { data: interview } = useQuery<Entity<InterviewWithCandidateDetailsAndJobDescription>>({
    queryKey: ["interview", id],
    queryFn: async () => {
      const response = await fetch(`/api/interviews/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch interview");
      }

      return response.json();
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ interviewId: params.interviewId }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["interview", params.interviewId],
      });
      setShowTakeover(false);
      router.push(`/dashboard/interviews/${params.interviewId}/reports`);
    },
    onError: (error) => {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report. Please try again.");
      setShowTakeover(false);

      queryClient.invalidateQueries({
        queryKey: ["interview", params.interviewId],
      });
      router.push(`/dashboard/interviews/${params.interviewId}/reports`);
    },
  });

  const timeout = useRef<number | null>(null);
  const ref = useRef<ComponentRef<typeof Messages> | null>(null);

  // optional: use configId from environment variable
  const configId = process.env.NEXT_PUBLIC_HUME_CONFIG_ID;

  const [interviewStarted, setInterviewStarted] = useState(false);
  const [showTakeover, setShowTakeover] = useState(false);

  useEffect(() => {
    if (interviewEnded) {
      setShowTakeover(true);
      generateReportMutation.mutate();
    }
  }, [interviewEnded, generateReportMutation]);

  return (
    <div className={"relative grid grid-rows-[1fr_auto] mx-auto w-full overflow-auto h-full"}>
      <VoiceProvider
        auth={{ type: "accessToken", value: accessToken }}
        configId={configId}
        sessionSettings={{
          type: "session_settings",
          systemPrompt: createInterviewInstructions({
            cvText: interview?.data.submittedCVText ?? "",
            structuredCandidateDetails: interview?.data
              .candidateDetails as unknown as CandidateDetails,
            structuredJobDescription: interview?.data.jobDescription as unknown as z.infer<
              typeof StructuredJobDescriptionSchema
            >,
            duration: interview?.data.duration ?? 15,
            interviewType: interview?.data.type ?? "behavioral",
          }),
          context: {
            text: `You are an AI interviewer for Interview Optimiser, conducting mock interviews to help candidates prepare for job roles. Your goal is to ask relevant, insightful questions based on the candidate data and job role information, focusing on ${interview?.data.type} questions.

            Do not interrupt the candidate; always let them finish their thoughts. If the candidate's response seems incomplete, use affirming interjections like "uh-huh" to encourage them to continue. Use positive reinforcement and adjust the difficulty of questions based on the candidate's performance, allowing them to expand and providing feedback when necessary.`,
            type: "persistent",
          },
        }}
        onMessage={() => {
          if (timeout.current) {
            window.clearTimeout(timeout.current);
          }

          timeout.current = window.setTimeout(() => {
            if (ref.current) {
              const scrollHeight = (ref.current as Element).scrollHeight;

              (ref.current as Element).scrollTo({
                top: scrollHeight,
                behavior: "smooth",
              });
            }
          }, 200);
        }}
      >
        <TimerHume
          totalTime={(interview?.data.duration ?? 15) * 60}
          setInterviewEnded={setInterviewEnded}
        />
        {interviewStarted ? (
          <Messages ref={ref} />
        ) : (
          <MessagesPlaceholder setInterviewStarted={setInterviewStarted} />
        )}
        <Controls />

        <AnimatePresence>{showTakeover && <GeneratingReportTakeover />}</AnimatePresence>
      </VoiceProvider>
    </div>
  );
}
