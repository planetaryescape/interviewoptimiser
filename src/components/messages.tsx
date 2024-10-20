"use client";

import { cn } from "@/lib/utils";
import { useVoice } from "@humeai/voice-react";
import { AnimatePresence, motion } from "framer-motion";
import { ComponentRef, forwardRef } from "react";
import { Expressions } from "./expressions";

export const Messages = forwardRef<
  ComponentRef<typeof motion.div>,
  Record<never, never>
>(function Messages(_, ref) {
  const { messages } = useVoice();

  return (
    <motion.div
      layoutScroll
      className="overflow-auto p-4 h-full row-span-1 bg-[#3c4a3e] text-white"
      ref={ref}
    >
      <motion.div className="max-w-2xl mx-auto w-full h-full flex flex-col justify-center items-center gap-4">
        <AnimatePresence mode="popLayout">
          {messages.slice(-3).map((msg, index, arr) => {
            if (
              msg.type === "user_message" ||
              msg.type === "assistant_message"
            ) {
              if (
                msg.message.content ===
                "<One minute left>Tell the candidate how much time is left and start wrapping up the interview and tell the candidate that a report will be generated</One minute left>."
              )
                return null;

              const isLatest = index === arr.length - 1;
              const fadeAmount = isLatest
                ? 1
                : 1 - (arr.length - index - 1) * 0.3;

              return (
                <motion.div
                  key={msg.type + index}
                  className={cn(
                    "w-full max-w-lg mx-auto",
                    "bg-transparent",
                    "rounded-lg",
                    isLatest ? "mb-16 text-center" : "mb-4 absolute",
                    isLatest
                      ? "z-10"
                      : index === arr.length - 2
                      ? "z-5 top-4 left-1/2 transform -translate-x-1/2 opacity-50"
                      : "z-0 top-0 left-1/2 transform -translate-x-1/2 opacity-25"
                  )}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{
                    opacity: fadeAmount,
                    y: 0,
                    scale: isLatest ? 1 : 0.9,
                  }}
                  exit={{ opacity: 0, y: -50, scale: 0.9 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  style={{
                    fontSize: isLatest
                      ? "1.5rem"
                      : `${1 - (arr.length - index - 1) * 0.2}rem`,
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  <div className="text-xs capitalize font-medium leading-none opacity-50 mb-2">
                    {msg.message.role}
                  </div>
                  <div className="mb-2">{msg.message.content}</div>
                  {isLatest && (
                    <Expressions values={{ ...msg.models.prosody?.scores }} />
                  )}
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
