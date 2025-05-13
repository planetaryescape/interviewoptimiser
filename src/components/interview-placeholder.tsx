"use client";

import { InterviewSettings } from "@/components/interview-settings";
import { InterviewStartModal } from "@/components/interview-start-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useJob } from "@/hooks/useJob";
import { getRepository } from "@/lib/data/repositoryFactory";
import { idHandler } from "@/lib/utils/idHandler";
import { useVoice } from "@humeai/voice-react";
import * as Sentry from "@sentry/nextjs";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Home, Layout, MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { NewInterview } from "~/db/schema";

type NewInterviewWithPublicJobId = Omit<NewInterview, "jobId"> & {
  jobId: string;
};

export default function InterviewPlaceholder() {
  const [showModal, setShowModal] = useState(false);
  const params = useParams();
  const jobId = params.jobId as string;
  const { connect, status, chatMetadata } = useVoice();
  const { data: job, isLoading, error } = useJob(jobId);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const { mutateAsync: createInterview, isPending: isCreatingInterview } = useMutation({
    mutationFn: async (metadata: NewInterviewWithPublicJobId) => {
      const interviewRepo = await getRepository<NewInterviewWithPublicJobId>("interviews");
      return await interviewRepo.create({
        ...metadata,
        jobId: params.jobId as string,
        createdAt: new Date(),
        updatedAt: new Date(),
        customSessionId: metadata.customSessionId || null,
        requestId: metadata.requestId || null,
      });
    },
    onSuccess: (interview) => {
      router.push(
        `/dashboard/jobs/${jobId}/interviews/${idHandler.encode(interview?.data.id || 0)}`
      );
    },
    onError: (error) => {
      toast.error("Error creating interview. Please try again.");
      Sentry.withScope((scope) => {
        scope.setContext("params", params);
        Sentry.captureException(error);
      });
    },
  });

  useEffect(() => {
    if (chatMetadata?.chatGroupId && chatMetadata.chatId) {
      createInterview({
        jobId: params.jobId as string,
        chatGroupId: chatMetadata?.chatGroupId || "",
        customSessionId: chatMetadata?.customSessionId || "",
        requestId: chatMetadata?.requestId || "",
        humeChatId: chatMetadata?.chatId || "",
      });
    }
  }, [chatMetadata, createInterview, params.jobId]);

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
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <div className="bg-background/40 backdrop-blur-md p-2 rounded-full border border-border/30 shadow-sm">
          <ThemeToggle />
        </div>
        <div className="bg-background/40 backdrop-blur-md p-2 rounded-full border border-border/30 shadow-sm">
          <Link href={`/dashboard/jobs/${jobId}/reports`}>
            <X className="h-8 w-8 text-muted-foreground" />
          </Link>
        </div>
      </div>

      {/* Main Content - Using grid for perfect centering and spacing */}
      <div className="flex-1 grid place-items-center relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
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

        <div className="relative z-10 max-w-5xl w-full mx-auto px-4 flex flex-col items-center justify-center gap-12 py-10 mt-16 md:mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {job?.data?.candidateDetails?.name
                ? `Hello ${job.data.candidateDetails.name}!`
                : "Welcome!"}
            </h2>
            <div className="text-xl text-muted-foreground max-w-2xl mx-auto space-y-2">
              <p>
                You&apos;re about to start a
                {job?.data?.duration ? ` ${job.data.duration} minute` : ""}{" "}
                {job?.data?.type ? job.data.type.replace("_", " ") : "practice"} interview
                {job?.data?.jobDescription?.role || job?.data?.jobDescription?.company ? (
                  <>
                    {" "}
                    for
                    {job?.data?.jobDescription?.role
                      ? ` the role of ${job.data.jobDescription.role}`
                      : ""}
                    {job?.data?.jobDescription?.company
                      ? ` at ${job.data.jobDescription.company}`
                      : ""}
                  </>
                ) : null}
                .
              </p>
              <p className="text-sm text-muted-foreground">
                {job?.data?.jobDescription?.role
                  ? "We'll be focusing on questions related to your experience and skills that match the role requirements."
                  : "We'll be focusing on questions to help you improve your interview skills."}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full"
          >
            <InterviewSettings isSaving={isSaving} setIsSaving={setIsSaving} />
          </motion.div>

          {/* Start Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Button
              size="lg"
              disabled={isSaving}
              onClick={() => setShowModal(true)}
              className="relative group px-8 py-6 text-lg hover:scale-105 transition-transform"
            >
              {isSaving ? (
                <span className="animate-pulse">Preparing...</span>
              ) : (
                <>
                  <MessageCircle className="mr-2 h-5 w-5 group-hover:animate-wiggle" />
                  Start Interview
                </>
              )}
            </Button>
          </motion.div>

          {/* Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="mt-6 pt-6 border-t border-border/40 flex flex-wrap gap-4 justify-center w-full max-w-6xl"
          >
            <Button variant="outline" size="sm" asChild className="flex items-center gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </Button>

            <Button variant="outline" size="sm" asChild className="flex items-center gap-2">
              <Link href="/dashboard">
                <Layout className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      <InterviewStartModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onStart={handleStartInterview}
        isLoading={status.value === "connecting" || isCreatingInterview}
        duration={job?.data?.duration}
      />
    </div>
  );
}
