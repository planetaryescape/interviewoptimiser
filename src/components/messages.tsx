"use client";

import { Interview, NewInterview } from "@/db/schema";
import { getRepository } from "@/lib/data/repositoryFactory";
import { cn } from "@/lib/utils";
import { useVoice } from "@humeai/voice-react";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useParams } from "next/navigation";
import { ComponentRef, forwardRef, useEffect } from "react";
import * as R from "remeda";
import { toast } from "sonner";
import { Expressions } from "./expressions";

export const Messages = forwardRef<
  ComponentRef<typeof motion.div>,
  Record<never, never>
>(function Messages(_, ref) {
  const { messages } = useVoice();
  const queryClient = useQueryClient();
  const params = useParams();

  const partialTranscriptMutation = useMutation({
    mutationFn: async (interview: Partial<NewInterview>) => {
      const interviewRepo = await getRepository<Interview>("interviews");
      return await interviewRepo.update(params.id as string, interview);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interview", params.id] });
    },
    onError: (error) => {
      Sentry.withScope((scope) => {
        scope.setContext("params", params);
        Sentry.captureException(error);
      });
      toast.error("Error updating interview. Please try again.");
    },
  });

  useEffect(() => {
    if (messages.length === 0) return;
    partialTranscriptMutation.mutate({
      transcript: JSON.stringify(
        messages
          .map((msg) => {
            if (
              msg.type === "user_message" ||
              msg.type === "assistant_message"
            ) {
              return {
                role: msg.message.role,
                content: msg.message.content,
                prosody: R.pipe(
                  msg.models.prosody?.scores ?? ({} as Record<string, number>),
                  R.entries(),
                  R.sortBy(R.pathOr([1], 0)),
                  R.reverse(),
                  R.take(3)
                ),
              };
            }
            return null;
          })
          .filter((msg) => msg !== null)
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  return (
    <motion.div
      layoutScroll
      className={
        "overflow-auto p-4 h-full row-span-1 bg-blue-50 dark:bg-blue-950"
      }
      ref={ref}
    >
      <motion.div
        className={"max-w-2xl mx-auto w-full h-full flex flex-col gap-4"}
      >
        <AnimatePresence mode={"popLayout"}>
          {messages.map((msg, index) => {
            if (
              msg.type === "user_message" ||
              msg.type === "assistant_message"
            ) {
              if (
                msg.message.content ===
                "<One minute left>Tell the candidate how much time is left and start wrapping up the interview and tell the candidate that a report will be generated</One minute left>."
              )
                return null;
              return (
                <motion.div
                  key={msg.type + index}
                  className={cn(
                    "w-[80%]",
                    "bg-card",
                    "border border-border rounded",
                    msg.type === "user_message" ? "ml-auto" : ""
                  )}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: 0,
                  }}
                >
                  <div
                    className={cn(
                      "text-xs capitalize font-medium leading-none opacity-50 pt-4 px-3"
                    )}
                  >
                    {msg.message.role}
                  </div>
                  <div className={"pb-3 px-3"}>{msg.message.content}</div>
                  <Expressions values={{ ...msg.models.prosody?.scores }} />
                </motion.div>
              );
            }

            return null;
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
});

export default Messages;
