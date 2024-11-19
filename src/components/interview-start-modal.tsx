"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { MessageSquare, Mic, Pause, Volume2 } from "lucide-react";

type InterviewStartModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
};

export function InterviewStartModal({
  isOpen,
  onClose,
  onStart,
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
      description:
        "You can politely interrupt if needed - just like a real conversation",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <div className="relative overflow-hidden rounded-lg p-6">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background animate-gradient" />

          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-center mb-6">
              Before you begin your interview
            </h2>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {guidelines.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-card border border-border"
                >
                  <div className="flex items-start space-x-3">
                    <item.icon className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onStart} className="relative group">
                <div className="absolute inset-0 bg-primary opacity-20 group-hover:opacity-30 blur-md transition-all rounded-lg" />
                <span className="relative">Begin Interview</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
