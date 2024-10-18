"use client";

import { Interview, NewInterview } from "@/db/schema";
import { getRepository } from "@/lib/data/repositoryFactory";
import { cn } from "@/lib/utils";
import { useVoice } from "@humeai/voice-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, Phone } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
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
    sendUserInput,
  } = useVoice();
  const params = useParams();
  const queryClient = useQueryClient();

  const { mutate: updateInterview } = useMutation({
    mutationFn: async (interview: Partial<NewInterview>) => {
      const interviewRepo = await getRepository<Interview>("interviews");
      return await interviewRepo.update(params.id as string, interview);
    },
    onSuccess: (data) => {
      console.log("Interview updated:", data);
      queryClient.invalidateQueries({ queryKey: ["interview", params.id] });
    },
    onError: (error) => {
      console.error("Error updating interview:", error);
      toast.error("Error updating interview. Please try again.");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.value]);

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
          <motion.div
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
              {isMuted ? (
                <MicOff className={"size-4"} />
              ) : (
                <Mic className={"size-4"} />
              )}
            </Toggle>

            <div className={"relative grid h-8 w-48 shrink grow-0"}>
              <MicFFT fft={micFft} className={"fill-current"} />
            </div>

            <Button
              className={"flex items-center gap-1"}
              onClick={async () => {
                await updateInterview({
                  transcript: messages.reduce((acc, msg) => {
                    if (
                      msg.type === "user_message" ||
                      msg.type === "assistant_message"
                    ) {
                      return (
                        acc + `${msg.message.role}: \t${msg.message.content}\n`
                      );
                    }
                    return acc;
                  }, ""),
                });
                disconnect();
              }}
              variant={"destructive"}
            >
              <span>
                <Phone
                  className={"size-4 opacity-50"}
                  strokeWidth={2}
                  stroke={"currentColor"}
                />
              </span>
              <span>End Call</span>
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
