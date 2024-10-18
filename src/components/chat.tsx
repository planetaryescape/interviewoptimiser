"use client";

import { Interview } from "@/db/schema";
import { getRepository } from "@/lib/data/repositoryFactory";
import { createInterviewInstructions } from "@/utils/conversation_config";
import { VoiceProvider } from "@humeai/voice-react";
import { useQuery } from "@tanstack/react-query";
import { ComponentRef, useRef } from "react";
import { Controls } from "./controls";
import { Messages } from "./messages";
import { StartCall } from "./start-call";

export default function ClientComponent({
  id,
  accessToken,
}: {
  id: string;
  accessToken: string;
}) {
  const { data: interview } = useQuery({
    queryKey: ["interview", id],
    queryFn: async () => {
      const interviewRepo = await getRepository<Interview>("interviews");
      return await interviewRepo.getById(id);
    },
  });

  const timeout = useRef<number | null>(null);
  const ref = useRef<ComponentRef<typeof Messages> | null>(null);

  // optional: use configId from environment variable
  const configId = process.env["NEXT_PUBLIC_HUME_CONFIG_ID"];

  return (
    <div
      className={
        "relative grid grid-rows-[1fr_auto] mx-auto w-full overflow-auto h-full"
      }
    >
      <VoiceProvider
        auth={{ type: "accessToken", value: accessToken }}
        configId={configId}
        sessionSettings={{
          type: "session_settings",
          systemPrompt: createInterviewInstructions(
            interview?.data.submittedCVText ?? "",
            interview?.data.jobDescriptionText ?? "",
            interview?.data.duration ?? 15,
            interview?.data.type ?? "behavioral"
          ),
        }}
        onMessage={() => {
          if (timeout.current) {
            window.clearTimeout(timeout.current);
          }

          timeout.current = window.setTimeout(() => {
            if (ref.current) {
              const scrollHeight = ref.current.scrollHeight;

              ref.current.scrollTo({
                top: scrollHeight,
                behavior: "smooth",
              });
            }
          }, 200);
        }}
      >
        <Messages ref={ref} />
        <Controls />
        <StartCall />
      </VoiceProvider>
    </div>
  );
}
