"use client";

import { cn } from "@/lib/utils";
import { useVoice } from "@humeai/voice-react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, User } from "lucide-react";
import { ComponentRef, forwardRef } from "react";

export const Messages = forwardRef<
  ComponentRef<typeof motion.div>,
  Record<never, never>
>(function Messages(_, ref) {
  const { messages } = useVoice();

  const filteredMessages = messages
    .filter(
      (msg) => msg.type === "user_message" || msg.type === "assistant_message"
    )
    .filter(
      (msg) =>
        !msg.message.content?.includes("<One minute left>") &&
        msg.message.content?.trim() !== ""
    )
    .slice(-3);

  return (
    <motion.div
      layoutScroll
      className="relative h-full flex flex-col items-center justify-center bg-gradient-to-b from-background via-background/50 to-background overflow-hidden"
      ref={ref}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 grid grid-cols-6 gap-4 opacity-[0.02] pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <motion.div
            key={i}
            className="aspect-square bg-primary rounded-full"
            initial={{ scale: 0.8, opacity: 0.3 }}
            animate={{
              scale: [0.8, 1, 0.8],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>

      {/* Messages Container */}
      <motion.div
        className="relative max-w-3xl w-full mx-auto px-6 flex flex-col items-center justify-center gap-8"
        layout
      >
        <AnimatePresence mode="popLayout">
          {filteredMessages.map((msg, index, arr) => {
            const isLatest = index === arr.length - 1;
            const isSecondLast = index === arr.length - 2;

            return (
              <motion.div
                key={msg.type + index}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{
                  opacity: isLatest ? 1 : isSecondLast ? 0.7 : 0.4,
                  y: 0,
                  scale: isLatest ? 1 : 0.95,
                }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                }}
                className={cn(
                  "w-full relative",
                  isLatest ? "z-30" : isSecondLast ? "z-20" : "z-10"
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl p-6 backdrop-blur-sm border transition-all duration-300",
                    msg.type === "assistant_message"
                      ? "bg-primary/5 border-primary/10 hover:border-primary/20"
                      : "bg-secondary/5 border-secondary/10 hover:border-secondary/20",
                    isLatest ? "transform-none" : "transform",
                    !isLatest && "-translate-y-4"
                  )}
                >
                  {/* Message Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className={cn(
                        "p-1.5 rounded-full",
                        msg.type === "assistant_message"
                          ? "bg-primary/10"
                          : "bg-secondary/10"
                      )}
                    >
                      {msg.type === "assistant_message" ? (
                        <MessageCircle className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-sm font-medium capitalize">
                      {msg.type === "assistant_message"
                        ? "Interview Optimiser"
                        : "You"}
                    </span>
                  </div>

                  {/* Message Content */}
                  <div
                    className={cn(
                      "text-lg leading-relaxed",
                      isLatest ? "font-medium" : "font-normal"
                    )}
                  >
                    {msg.message.content}
                  </div>

                  {/* Prosody Indicators */}
                  {isLatest &&
                    msg.type === "user_message" &&
                    msg.models?.prosody && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-2 mt-4 text-sm"
                      >
                        {Object.entries(msg.models.prosody.scores || {})
                          .filter(([_, value]) => value > 0.5)
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <span
                              key={key}
                              className="px-3 py-1 rounded-full bg-secondary/10"
                            >
                              {key}: {Math.round(value * 100)}%
                            </span>
                          ))}
                      </motion.div>
                    )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
});

export default Messages;
