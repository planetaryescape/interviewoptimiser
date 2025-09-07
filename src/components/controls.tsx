"use client";

import { getRepository } from "@/lib/data/repositoryFactory";
import { cn } from "@/lib/utils";
import { clientIdHandler } from "@/lib/utils/clientIdHandler";
import { INTERVIEW_START_MESSAGE, formatTranscriptToJsonString } from "@/lib/utils/messageUtils";
import { unformatTime } from "@/lib/utils/unformatTime";
import {
  type InterviewWithPublicJobId,
  useActiveInterview,
  useActiveInterviewActions,
} from "@/stores/useActiveInterviewStore";
import { useVoice } from "@humeai/voice-react";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { MotionDiv } from "./common/motion";
import { useVoiceConfig } from "./interview-container/voice-config-context";
import { createSessionContext } from "./interview-container/voice-provider-config";
import { MicFFT } from "./mic-fft";
import { Button } from "./ui/button";
import { Toggle } from "./ui/toggle";

export function Controls() {
  const {
    disconnect,
    status,
    messages,
    isMuted,
    unmute,
    mute,
    micFft,
    fft,
    callDurationTimestamp,
    sendUserInput,
    connect,
    sendAssistantInput,
  } = useVoice();
  const { accessToken, configId, systemPrompt, interview } = useVoiceConfig();
  const params = useParams();
  const queryClient = useQueryClient();
  const { setInterviewEnded } = useActiveInterviewActions();
  const activeInterview = useActiveInterview();

  const { mutate: endInterview } = useMutation({
    mutationFn: async (interview: Partial<InterviewWithPublicJobId>) => {
      const interviewRepo = await getRepository<InterviewWithPublicJobId>("interviews");
      return await interviewRepo.update(clientIdHandler.formatId(activeInterview?.id), interview);
    },
    onSuccess: () => {
      sendAssistantInput("hang_up");
      disconnect();
      queryClient.invalidateQueries({
        queryKey: ["job", params.jobId],
      });
      setInterviewEnded(true);
    },
    onError: (error) => {
      sendAssistantInput("hang_up");
      disconnect();
      Sentry.withScope((scope) => {
        scope.setContext("params", params);
        Sentry.captureException(error);
      });
      toast.error("Error ending interview. Just be patient, we will try again.");
      setInterviewEnded(true);
    },
  });

  const initialUserMessageSentRef = useRef(false);

  useEffect(() => {
    if (status.value === "connected" && !initialUserMessageSentRef.current) {
      initialUserMessageSentRef.current = true;
      sendUserInput(INTERVIEW_START_MESSAGE);
    }
    return () => {
      initialUserMessageSentRef.current = false;
    };
  }, [status.value, sendUserInput]);

  return (
    <div
      className={cn(
        "w-full p-4 flex items-center justify-center",
        "bg-gradient-to-t from-card via-card/90 to-card/0 row-span-1"
      )}
    >
      <AnimatePresence>
        {status.value === "connected" ? (
          <MotionDiv
            initial={{
              y: "100%",
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: "100%",
              opacity: 0,
            }}
            className={
              "p-4 bg-card border border-border rounded-lg shadow-sm flex items-center gap-4"
            }
          >
            <div className={"flex items-center gap-1"}>
              <Toggle
                pressed={!isMuted}
                onPressedChange={() => {
                  if (isMuted) {
                    unmute();
                  } else {
                    mute();
                  }
                }}
              >
                {isMuted ? <MicOff className={"size-4"} /> : <Mic className={"size-4"} />}
              </Toggle>

              <div className={"relative grid h-12 w-48 shrink grow-0"}>
                <MicFFT fft={fft} className={"fill-primary"} />
              </div>

              <div className={"relative grid h-12 w-48 shrink grow-0"}>
                <MicFFT fft={micFft} className={"fill-current"} />
              </div>
            </div>

            <Button
              className={cn(
                "flex items-center gap-1",
                status.value !== "connected" ? "" : "hidden"
              )}
              onClick={async () => {
                await connect({
                  auth: { type: "accessToken", value: accessToken },
                  configId,
                  sessionSettings: {
                    type: "session_settings",
                    systemPrompt,
                    context: {
                      text: createSessionContext(interview),
                      type: "persistent",
                    },
                  },
                });
              }}
              variant={"default"}
            >
              Start Interview
            </Button>

            {/* <Button
              className={cn("flex items-center gap-1")}
              onClick={async () => {
                disconnect();
              }}
              variant={"destructive"}
            >
              Stop Interview
            </Button> */}

            <Button
              className={cn(
                "flex items-center gap-1",
                status.value !== "connected" ? "hidden" : ""
              )}
              onClick={async () => {
                await endInterview({
                  ...activeInterview,
                  actualTime: Math.floor(unformatTime(callDurationTimestamp) / 60),
                  jobId: params.jobId as string,
                  transcript: formatTranscriptToJsonString(messages),
                });
              }}
              variant={"destructive"}
            >
              End Interview
            </Button>
          </MotionDiv>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
