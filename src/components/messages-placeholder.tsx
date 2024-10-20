"use client";

import { Button } from "@/components/ui/button";
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
    <div className="h-full flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-950 text-white p-4">
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

      <div className="w-full max-w-2xl mx-auto space-y-4">
        {dummyMessages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className={`w-full max-w-lg mx-auto bg-transparent rounded-lg p-4 border border-white/20 ${
              msg.role === "assistant" ? "text-left" : "text-right ml-auto"
            }`}
            style={{
              fontSize: index === dummyMessages.length - 1 ? "1.25rem" : "1rem",
              opacity: 1 - index * 0.3,
            }}
          >
            <div className="text-xs capitalize font-medium leading-none opacity-50 mb-2">
              {msg.role}
            </div>
            <div>{msg.content}</div>
          </motion.div>
        ))}
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
