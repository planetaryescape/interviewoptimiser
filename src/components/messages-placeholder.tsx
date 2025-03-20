"use client";

import { InterviewStartModal } from "@/components/interview-start-modal";
import { Button } from "@/components/ui/button";
import { useActiveInterviewEnded } from "@/stores/useActiveInterviewStore";
import { useVoice } from "@humeai/voice-react";
import { motion } from "framer-motion";
import { ChevronRight, Home, MessageCircle, Mic, Sparkles, Target } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function InterviewPlaceholder({
  setInterviewStarted,
}: {
  setInterviewStarted: (value: boolean) => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const params = useParams();
  const interviewId = params.interviewId;
  const { connect, status } = useVoice();
  const interviewEnded = useActiveInterviewEnded();

  const features = [
    {
      id: "voice",
      icon: Mic,
      title: "Real-time Voice Interaction",
      description: "Natural conversation with AI-powered responses",
    },
    {
      id: "feedback",
      icon: Target,
      title: "Personalized Feedback",
      description: "Get instant insights on your performance",
    },
    {
      id: "analysis",
      icon: Sparkles,
      title: "AI-Powered Analysis",
      description: "Comprehensive evaluation of your interview skills",
    },
  ];

  const handleStartInterview = async () => {
    if (status.value !== "connected") {
      try {
        await connect();
        setInterviewStarted(true);
      } catch (error) {
        console.error("Failed to connect:", error);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Breadcrumbs */}
      <div className="px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center text-sm text-muted-foreground">
          <Link
            href="/dashboard"
            className="flex items-center hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link
            href={`/dashboard/interviews/${interviewId}/reports`}
            className="hover:text-foreground transition-colors"
          >
            Reports
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground">Interview</span>
        </div>
      </div>

      {/* Main Content - Using grid for perfect centering and spacing */}
      <div className="flex-1 grid place-items-center relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={`bg-element-${i + 1}`}
              className="absolute rounded-full bg-primary/10 blur-3xl"
              style={{
                width: Math.random() * 400 + 200,
                height: Math.random() * 400 + 200,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, 30, 0],
                y: [0, 30, 0],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 10,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-5xl w-full mx-auto px-4 flex flex-col items-center justify-center gap-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Ready for Your Interview
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience a realistic interview simulation powered by advanced AI
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 w-full"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-background to-primary/5 p-6 border border-primary/10 hover:border-primary/20 transition-colors"
              >
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <feature.icon className="h-8 w-8 text-primary mb-4 relative z-10" />
                <h3 className="font-semibold mb-2 relative z-10">{feature.title}</h3>
                <p className="text-sm text-muted-foreground relative z-10">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Start Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Button
              size="lg"
              disabled={interviewEnded}
              onClick={() => setShowModal(true)}
              className="relative group px-8 py-6 text-lg hover:scale-105 transition-transform"
            >
              <div className="absolute inset-0 bg-primary opacity-20 group-hover:opacity-30 blur-xl transition-all rounded-lg" />
              <MessageCircle className="mr-2 h-5 w-5" />
              Start Interview
            </Button>
          </motion.div>
        </div>
      </div>

      <InterviewStartModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onStart={() => {
          setShowModal(false);
          handleStartInterview();
        }}
      />
    </div>
  );
}
