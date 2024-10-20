"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useVoice } from "@humeai/voice-react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function InterviewPlaceholder({
  interviewEnded,
  setInterviewStarted,
}: {
  interviewEnded: boolean;
  setInterviewStarted: (value: boolean) => void;
}) {
  const { connect, status } = useVoice();
  const dummyMessages = [
    {
      role: "assistant",
      content: "Hello! Welcome to your interview. How are you feeling today?",
    },
    {
      role: "user",
      content: "I'm feeling a bit nervous, but excited for the opportunity.",
    },
    {
      role: "assistant",
      content:
        "That's perfectly normal. Take a deep breath, and we'll start with some easy questions.",
    },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">Welcome to Your Interview</h2>
        <p className="text-lg mb-4">
          Click the &quot;Start Interview&quot; button below to begin.
        </p>
        <p className="text-sm opacity-75">
          Your messages will appear here once the interview starts.
        </p>
      </motion.div>

      <div className="w-full max-w-2xl mx-auto space-y-4 border-2 border-gray-500 rounded-lg p-4">
        {dummyMessages.map((msg, index, arr) => {
          const isLatest = index === arr.length - 1;
          const fadeAmount = isLatest ? 1 : 1 - (arr.length - index - 1) * 0.3;

          return (
            <motion.div
              key={index}
              className={cn(
                "w-full max-w-lg mx-auto",
                "bg-transparent",
                "rounded-lg text-center",
                isLatest ? "mb-16" : "mb-4",
                isLatest
                  ? "z-10"
                  : index === arr.length - 2
                  ? "z-5 transform opacity-50"
                  : "z-0 transform opacity-25",
                msg.role === "assistant"
                  ? "text-yellow-900 dark:text-yellow-200"
                  : "text-red-900 dark:text-red-200"
              )}
              initial={{
                opacity: 0,
                y: 50,
                scale: 0.9,
              }}
              animate={{
                opacity: fadeAmount,
                y: 0,
                scale: isLatest ? 1 : 0.9,
              }}
              exit={{
                opacity: 0,
                y: -50,
                scale: 0.9,
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{
                fontSize: isLatest ? "1.5rem" : `1rem`,
                transition: "all 0.3s ease-in-out",
              }}
            >
              <div className="text-xs capitalize font-medium leading-none opacity-50 mb-2">
                {msg.role}
              </div>
              <div className="mb-2">{msg.content}</div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-8"
      >
        <Button
          size="lg"
          disabled={interviewEnded}
          className={"z-50"}
          onClick={() => {
            if (status.value !== "connected") {
              connect()
                .then(() => {
                  setInterviewStarted(true);
                })
                .catch(() => {})
                .finally(() => {});
            }
          }}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Start Interview
        </Button>
      </motion.div>
    </div>
  );
}
