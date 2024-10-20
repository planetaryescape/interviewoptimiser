import { cn } from "@/lib/utils";
import { useVoice } from "@humeai/voice-react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

export function StartCall({
  interviewEnded,
  setInterviewStarted,
}: {
  interviewEnded: boolean;
  setInterviewStarted: (value: boolean) => void;
}) {
  const { status, connect } = useVoice();

  return (
    <div
      className={cn(
        "w-full p-4 flex items-center justify-center",
        "bg-gradient-to-t from-card via-card/90 to-card/0 row-span-1",
        status.value === "connected" ? "hidden" : ""
      )}
    >
      <AnimatePresence>
        {status.value !== "connected" ? (
          <motion.div
            className={cn(
              "w-full p-4 flex items-center justify-center row-span-1"
            )}
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
          >
            <AnimatePresence>
              <motion.div
                variants={{
                  initial: { scale: 0.5 },
                  enter: { scale: 1 },
                  exit: { scale: 0.5 },
                }}
              >
                <Button
                  disabled={interviewEnded}
                  className={"z-50"}
                  onClick={() => {
                    connect()
                      .then(() => {
                        setInterviewStarted(true);
                      })
                      .catch(() => {})
                      .finally(() => {});
                  }}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Start Interview
                </Button>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
