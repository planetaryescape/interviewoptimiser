"use client";

import { getRepository } from "@/lib/data/repositoryFactory";
import { cn } from "@/lib/utils";
import { formatMessage } from "@/lib/utils/messageUtils";
import { unformatTime } from "@/lib/utils/unformatTime";
import { useVoice } from "@humeai/voice-react";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { Interview, NewInterview } from "~/db/schema";
import { MotionDiv } from "./common/motion";
import { MicFFT } from "./mic-fft";
import { Button } from "./ui/button";
import { Toggle } from "./ui/toggle";

export function Controls({
  setInterviewEnded,
}: {
  setInterviewEnded: (ended: boolean) => void;
}) {
  const {
    disconnect,
    status,
    messages,
    isMuted,
    unmute,
    mute,
    micFft,
    callDurationTimestamp,
    sendUserInput,
    sendAssistantInput,
  } = useVoice();
  const params = useParams();
  const queryClient = useQueryClient();

  const { mutate: updateInterview } = useMutation({
    mutationFn: async (interview: Partial<NewInterview>) => {
      const interviewRepo = await getRepository<Interview>("interviews");
      return await interviewRepo.update(params.interviewId as string, interview);
    },
    onSuccess: () => {
      sendAssistantInput("hang_up");
      disconnect();
      queryClient.invalidateQueries({
        queryKey: ["interview", params.interviewId],
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
      toast.error("Error updating interview. Please try again.");
      setInterviewEnded(true);
    },
  });

  const initialUserMessageSentRef = useRef(false);

  useEffect(() => {
    if (status.value === "connected" && !initialUserMessageSentRef.current) {
      initialUserMessageSentRef.current = true;
      sendUserInput("I'm ready to start the interview");
    }
    return () => {
      initialUserMessageSentRef.current = false;
    };
  }, [status.value, sendUserInput]);

  return (
    <div
      className={cn(
        "w-full p-4 flex items-center justify-center",
        "bg-gradient-to-t from-card via-card/90 to-card/0 row-span-1",
        status.value !== "connected" ? "hidden" : ""
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

            <div className={"relative grid h-8 w-48 shrink grow-0"}>
              <MicFFT fft={micFft} className={"fill-current"} />
            </div>

            <Button
              className={"flex items-center gap-1"}
              onClick={async () => {
                await updateInterview({
                  actualTime: Math.floor(unformatTime(callDurationTimestamp) / 60),
                  transcript: JSON.stringify(
                    messages
                      .map((msg) => {
                        if (msg.type === "user_message" || msg.type === "assistant_message") {
                          return {
                            role: msg.message.role,
                            content: formatMessage(msg.message.content),
                            prosody: msg.models.prosody?.scores ?? {},
                          };
                        }
                        return null;
                      })
                      .filter((msg) => msg !== null)
                  ),
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
