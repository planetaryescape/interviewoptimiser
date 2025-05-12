"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Loader2, MessageSquare, Mic, Pause, Volume2 } from "lucide-react";
import Link from "next/link";

type InterviewStartModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
  isLoading: boolean;
};

export function InterviewStartModal({
  isOpen,
  onClose,
  onStart,
  isLoading,
}: InterviewStartModalProps) {
  const guidelines = [
    {
      icon: Volume2,
      title: "Quiet Environment",
      description: "Ensure you're in a quiet space to avoid interference",
    },
    {
      icon: Mic,
      title: "Natural Speech",
      description: "Speak naturally as you would in a real interview",
    },
    {
      icon: Pause,
      title: "Manage Pauses",
      description: "The interviewer may prompt you after long pauses",
    },
    {
      icon: MessageSquare,
      title: "Feel Free to Interrupt",
      description: "You can politely interrupt if needed - just like a real conversation",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogTitle>Before you begin your interview</DialogTitle>
        <DialogDescription>
          Please review these guidelines to ensure the best interview experience.
        </DialogDescription>

        <div className="relative overflow-hidden rounded-lg p-6">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background animate-gradient" />

          <div className="relative z-10">
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {guidelines.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-card border border-border"
                >
                  <div className="flex items-start space-x-3">
                    <item.icon className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-sm text-muted-foreground text-center mb-6">
              By starting the interview, you agree to the collection and processing of your data as
              outlined in our{" "}
              <Link href="/privacy-policy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onStart} className="relative group">
                <div className="absolute inset-0 bg-primary opacity-20 group-hover:opacity-30 blur-md transition-all rounded-lg" />
                <span className="relative">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Begin Interview"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
