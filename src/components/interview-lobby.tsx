"use client";

import useCustomisedSystemPrompt from "@/hooks/useCustomisedSystemPrompt";
import { VoiceProvider } from "@humeai/voice-react";
import MessagesPlaceholder from "./interview-placeholder";

export default function InterviewLobby({
  jobId,
  accessToken,
}: {
  jobId: string;
  accessToken: string;
}) {
  const { systemPrompt, job } = useCustomisedSystemPrompt({ jobId });

  const configId = process.env.NEXT_PUBLIC_HUME_CONFIG_ID;

  return (
    <div className={"relative grid grid-rows-[1fr_auto] mx-auto w-full overflow-auto h-full"}>
      <VoiceProvider
        auth={{ type: "accessToken", value: accessToken }}
        configId={configId}
        sessionSettings={{
          type: "session_settings",
          systemPrompt,
          context: {
            text: `You are an AI interviewer called Cora, the lead interviewer at Interview Optimiser. You are conducting a mock interview with ${job?.data?.candidateDetails.name} to help them prepare for a ${job?.data?.jobDescription.role} job at ${job?.data?.jobDescription.company}. Your goal is to ask relevant, insightful questions based on the candidate data and job role information, focusing on ${job?.data?.type} questions.

            Do not interrupt the candidate; always let them finish their thoughts. If the candidate's response seems incomplete, use affirming interjections like "uh-huh" to encourage them to continue. Use positive reinforcement and adjust the difficulty of questions based on the candidate's performance, allowing them to expand and providing feedback when necessary.

            ${
              job?.data?.jobDescription?.keyQuestions?.length
                ? `IMPORTANT: These are the 5 key questions that MUST be asked during the interview. They are the HIGHEST PRIORITY questions and should be asked before exploring other topics. These questions have been specifically generated for this role and are crucial for assessing the candidate's suitability:

            ${job?.data?.jobDescription?.keyQuestions
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
      >
        <MessagesPlaceholder />
      </VoiceProvider>
    </div>
  );
}
