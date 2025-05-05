"use client";

import {
  useActiveInterviewActions,
  useActiveInterviewEnded,
} from "@/stores/useActiveInterviewStore";
import { createInterviewInstructions } from "@/utils/conversation_config";
import { VoiceProvider } from "@humeai/voice-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { type ComponentRef, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { InferResultType } from "~/db/helpers";
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

  const { data: interview } = useQuery<any>({
    // | InterviewWithCandidateDetailsAndJobDescription
    // | Entity<InterviewWithCandidateDetailsAndJobDescription>
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
  const hasGeneratedReportRef = useRef(false);

  // optional: use configId from environment variable
  const configId = process.env.NEXT_PUBLIC_HUME_CONFIG_ID;

  const [interviewStarted, setInterviewStarted] = useState(false);
  const [showTakeover, setShowTakeover] = useState(false);

  useEffect(() => {
    if (interviewEnded && !hasGeneratedReportRef.current) {
      hasGeneratedReportRef.current = true;
      setShowTakeover(true);
      generateReportMutation.mutate();
    }
  }, [interviewEnded, generateReportMutation]);

  const systemPrompt = useMemo(() => {
    return createInterviewInstructions({
      cvText: interview?.data?.submittedCVText ?? "",
      structuredCandidateDetails: {
        ...interview?.data?.candidateDetails,
        location:
          interview?.data?.candidateDetails?.location ?? interview?.candidateDetails.location ?? "",
        name: interview?.data?.candidateDetails?.name ?? interview?.candidateDetails.name ?? "",
        email: interview?.data?.candidateDetails?.email ?? interview?.candidateDetails.email ?? "",
        phone: interview?.data?.candidateDetails?.phone ?? interview?.candidateDetails.phone ?? "",
        currentRole:
          interview?.data?.candidateDetails?.currentRole ??
          interview?.candidateDetails.currentRole ??
          "",
        professionalSummary:
          interview?.data?.candidateDetails?.professionalSummary ??
          interview?.candidateDetails.professionalSummary ??
          "",
        linkedinUrl:
          interview?.data?.candidateDetails?.linkedinUrl ??
          interview?.candidateDetails.linkedinUrl ??
          "",
        portfolioUrl:
          interview?.data?.candidateDetails?.portfolioUrl ??
          interview?.candidateDetails.portfolioUrl ??
          "",
        otherUrls:
          interview?.data?.candidateDetails?.otherUrls ??
          interview?.candidateDetails.otherUrls ??
          [],
      },
      structuredJobDescription: {
        ...interview?.data?.jobDescription,
        role: interview?.data?.jobDescription?.role ?? interview?.jobDescription.role ?? "",
        seniority:
          interview?.data?.jobDescription?.seniority ?? interview?.jobDescription.seniority ?? "",
        company:
          interview?.data?.jobDescription?.company ?? interview?.jobDescription.company ?? "",
        employmentType:
          interview?.data?.jobDescription?.employmentType ??
          interview?.jobDescription.employmentType ??
          "",
        location:
          interview?.data?.jobDescription?.location ?? interview?.jobDescription.location ?? "",
        industry:
          interview?.data?.jobDescription?.industry ?? interview?.jobDescription.industry ?? "",
        requiredQualifications:
          interview?.data?.jobDescription?.requiredQualifications ??
          interview?.jobDescription.requiredQualifications ??
          [],
        requiredExperience:
          interview?.data?.jobDescription?.requiredExperience ??
          interview?.jobDescription.requiredExperience ??
          [],
        requiredSkills:
          interview?.data?.jobDescription?.requiredSkills ??
          interview?.jobDescription.requiredSkills ??
          [],
        preferredQualifications:
          interview?.data?.jobDescription?.preferredQualifications ??
          interview?.jobDescription.preferredQualifications ??
          [],
        preferredSkills:
          interview?.data?.jobDescription?.preferredSkills ??
          interview?.jobDescription.preferredSkills ??
          [],
        responsibilities:
          interview?.data?.jobDescription?.responsibilities ??
          interview?.jobDescription.responsibilities ??
          [],
        benefits:
          interview?.data?.jobDescription?.benefits ?? interview?.jobDescription.benefits ?? [],
        keyTechnologies:
          interview?.data?.jobDescription?.keyTechnologies ??
          interview?.jobDescription.keyTechnologies ??
          [],
        keywords:
          interview?.data?.jobDescription?.keywords ?? interview?.jobDescription.keywords ?? [],
        keyQuestions:
          interview?.data?.jobDescription?.keyQuestions ??
          interview?.jobDescription.keyQuestions ??
          [],
      },
      duration: interview?.data?.duration ?? interview?.duration ?? 15,
      interviewType: interview?.data?.type ?? interview?.type ?? "behavioral",
    });
  }, [interview]);

  return (
    <div className={"relative grid grid-rows-[1fr_auto] mx-auto w-full overflow-auto h-full"}>
      <VoiceProvider
        auth={{ type: "accessToken", value: accessToken }}
        configId={configId}
        sessionSettings={{
          type: "session_settings",
          systemPrompt,
          context: {
            text: `You are an AI interviewer called Cora, the lead interviewer at Interview Optimiser. You are conducting a mock interview with ${interview?.data?.candidateDetails.name} to help them prepare for a ${interview?.data?.jobDescription.role} job at ${interview?.data?.jobDescription.company}. Your goal is to ask relevant, insightful questions based on the candidate data and job role information, focusing on ${interview?.data?.type} questions.

            Do not interrupt the candidate; always let them finish their thoughts. If the candidate's response seems incomplete, use affirming interjections like "uh-huh" to encourage them to continue. Use positive reinforcement and adjust the difficulty of questions based on the candidate's performance, allowing them to expand and providing feedback when necessary.

            ${
              interview?.data?.jobDescription?.keyQuestions?.length
                ? `IMPORTANT: These are the 5 key questions that MUST be asked during the interview. They are the HIGHEST PRIORITY questions and should be asked before exploring other topics. These questions have been specifically generated for this role and are crucial for assessing the candidate's suitability:

            ${interview?.data?.jobDescription?.keyQuestions
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
          totalTime={(interview?.data?.duration ?? 15) * 60}
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
