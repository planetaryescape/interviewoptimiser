"use client";

import { InterviewStartModal } from "@/components/interview-start-modal";
import { Button } from "@/components/ui/button";
import { useJob } from "@/hooks/useInterview";
import { getRepository } from "@/lib/data/repositoryFactory";
import { idHandler } from "@/lib/utils/idHandler";
import {
  useActiveInterviewActions,
  useActiveInterviewEnded,
} from "@/stores/useActiveInterviewStore";
import { useVoice } from "@humeai/voice-react";
import * as Sentry from "@sentry/nextjs";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MessageCircle, Mic, Sparkles, Target } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { NewChat } from "~/db/schema";

export default function InterviewPlaceholder() {
  const [showModal, setShowModal] = useState(false);
  const params = useParams();
  const jobId = params.jobId as string;
  const { connect, status, chatMetadata } = useVoice();
  const interviewEnded = useActiveInterviewEnded();
  const { data: job, isLoading, error } = useJob(jobId);
  const { setInterviewStarted, setActiveInterviewChat } = useActiveInterviewActions();

  const { mutateAsync: createChat } = useMutation({
    mutationFn: async (metadata: Omit<NewChat, "jobId"> & { jobId: string }) => {
      const chatRepo = await getRepository<Omit<NewChat, "jobId"> & { jobId: string }>("chats");
      return await chatRepo.create({
        ...metadata,
        jobId: params.jobId as string,
        createdAt: new Date(),
        updatedAt: new Date(),
        customSessionId: metadata.customSessionId || null,
        requestId: metadata.requestId || null,
      });
    },
    onSuccess: (chat) => {
      setInterviewStarted(true);
      setActiveInterviewChat({
        ...chat.data,
        id: chat.data.id || 0,
        actualTime: chat.data.actualTime || null,
        transcript: chat.data.transcript || null,
        jobId: idHandler.decode(params.jobId as string),
        createdAt: chat.data.createdAt || new Date(),
        updatedAt: chat.data.updatedAt || new Date(),
        customSessionId: chat.data.customSessionId || null,
        requestId: chat.data.requestId || null,
      });
    },
    onError: (error) => {
      toast.error("Error creating chat. Please try again.");
      Sentry.withScope((scope) => {
        scope.setContext("params", params);
        Sentry.captureException(error);
      });
    },
  });

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

  useEffect(() => {
    console.log("chatMetadata", chatMetadata);
    if (chatMetadata?.chatGroupId && chatMetadata.chatId) {
      createChat({
        jobId: params.jobId as string,
        chatGroupId: chatMetadata?.chatGroupId || "",
        customSessionId: chatMetadata?.customSessionId || "",
        requestId: chatMetadata?.requestId || "",
        humeChatId: chatMetadata?.chatId || "",
      });
    }
  }, [chatMetadata, createChat, params.jobId]);

  const handleStartInterview = async () => {
    if (status.value !== "connected") {
      try {
        await connect();
      } catch (error) {
        Sentry.withScope((scope) => {
          scope.setContext("params", params);
          Sentry.captureException(error);
        });
        toast.error("Error connecting to voice. Please try again.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading interview details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-destructive">Failed to load interview details</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
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
              {job?.candidateDetails?.name ? `Hello ${job.candidateDetails.name}!` : "Welcome!"}
            </h2>
            <div className="text-xl text-muted-foreground max-w-2xl mx-auto space-y-2">
              <p>
                You&apos;re about to start a{job?.duration ? ` ${job.duration} minute` : ""}{" "}
                {job?.type ? job.type.replace("_", " ") : "practice"} interview
                {job?.jobDescription?.role || job?.jobDescription?.company ? (
                  <>
                    {" "}
                    for
                    {job?.jobDescription?.role ? ` the role of ${job.jobDescription.role}` : ""}
                    {job?.jobDescription?.company ? ` at ${job.jobDescription.company}` : ""}
                  </>
                ) : null}
                .
              </p>
              <p className="text-sm text-muted-foreground">
                {job?.jobDescription?.role
                  ? "We'll be focusing on questions related to your experience and skills that match the role requirements."
                  : "We'll be focusing on questions to help you improve your interview skills."}
              </p>
            </div>
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
