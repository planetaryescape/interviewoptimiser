"use client";

import { Interview } from "@/db/schema";
import { getRepository } from "@/lib/data/repositoryFactory";
import { createInterviewInstructions } from "@/utils/conversation_config";
import { VoiceProvider } from "@humeai/voice-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { ComponentRef, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Controls } from "./controls";
import { GeneratingReportTakeover } from "./generating-report-takeover";
import { Messages } from "./messages";
import MessagesPlaceholder from "./messages-placeholder";
import { TimerHume } from "./timer-hume";

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

  const { data: interview } = useQuery({
    queryKey: ["interview", id],
    queryFn: async () => {
      const interviewRepo = await getRepository<
        Interview & {
          report: Report;
        }
      >("interviews");
      return await interviewRepo.getById(id);
    },
  });

  if (interview?.data.report) {
    router.push(`/dashboard/interview/${id}/report`);
  }

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ interviewId: params.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interview", params.id] });
      // setShowTakeover(false);
      router.push(`/dashboard`);
    },
    onError: (error) => {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report. Please try again.");
      setShowTakeover(false);
    },
  });

  const timeout = useRef<number | null>(null);
  const ref = useRef<ComponentRef<typeof Messages> | null>(null);

  // optional: use configId from environment variable
  const configId = process.env["NEXT_PUBLIC_HUME_CONFIG_ID"];
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [showTakeover, setShowTakeover] = useState(false);

  useEffect(() => {
    if (interviewEnded) {
      setShowTakeover(true);
      generateReportMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewEnded]);

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
          <MessagesPlaceholder
            interviewEnded={interviewEnded}
            setInterviewStarted={setInterviewStarted}
          />
        )}
        <Controls setInterviewEnded={setInterviewEnded} />

        <AnimatePresence>
          {showTakeover && <GeneratingReportTakeover />}
        </AnimatePresence>
      </VoiceProvider>
    </div>
  );
}
