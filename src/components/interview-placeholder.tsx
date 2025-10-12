"use client";

import {
  InterviewSettings,
  type NewInterviewWithPublicJobId,
} from "@/components/interview-settings";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useJob } from "@/hooks/useJob";
import { useUser } from "@/hooks/useUser";
import { getRepository } from "@/lib/data/repositoryFactory";
import { clientIdHandler } from "@/lib/utils/clientIdHandler";
import { useVoice } from "@humeai/voice-react";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Home, Layout, MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { InterviewStartModal } from "./interview-start-modal";

interface InterviewPlaceholderProps {
  accessToken?: string;
  configId?: string;
}

export function InterviewPlaceholder({ accessToken, configId }: InterviewPlaceholderProps = {}) {
  const [showModal, setShowModal] = useState(false);
  const params = useParams();
  const jobId = params.jobId as string;
  const queryClient = useQueryClient();
  // useJob will automatically refetch if candidateDetails or jobDescription are missing
  // staleTime = 0 when incomplete, so cache is never used for partial data
  const { data: job, isLoading, error } = useJob(jobId);
  const { data: user, isLoading: isUserLoading } = useUser();
  const router = useRouter();

  const [interviewToBeCreated, setInterviewToBeCreated] = useState<
    Required<NewInterviewWithPublicJobId>
  >({
    jobId,
    keyQuestions: [],
    chatGroupId: "",
    customSessionId: "",
    requestId: "",
    humeChatId: "",
    type: "behavioral",
    duration: 15,
    id: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    transcript: "",
    actualTime: 0,
  });

  const { mutateAsync: createInterview, isPending: isCreatingInterview } = useMutation({
    mutationFn: async (interview: NewInterviewWithPublicJobId) => {
      const interviewRepo = await getRepository<NewInterviewWithPublicJobId>("interviews");

      const keyQuestionsResponse = await fetch("/api/extract/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          interviewType: interviewToBeCreated.type,
          duration: interviewToBeCreated.duration,
        }),
      });

      if (!keyQuestionsResponse.ok) {
        throw new Error("Failed to extract key questions");
      }

      const keyQuestions = await keyQuestionsResponse.json();

      return interviewRepo.create({
        ...interview,
        jobId: params.jobId as string,
        createdAt: new Date(),
        updatedAt: new Date(),
        keyQuestions: keyQuestions.data,
        type: interviewToBeCreated.type,
        duration: interviewToBeCreated.duration,
        // Hume metadata will be populated later when connection is established
      });
    },
    onSuccess: (interview) => {
      // Pre-populate React Query cache to avoid redundant fetches on redirect
      const interviewId = clientIdHandler.formatId(interview?.data.id);

      // Cache the newly created interview
      queryClient.setQueryData(["interview", interviewId], interview);

      // Cache the job data we already have
      if (job) {
        queryClient.setQueryData(["job", jobId], job);
      }

      // Redirect - interview page will use cached data instantly
      router.push(`/dashboard/jobs/${jobId}/interviews/${interviewId}`);
    },
    onError: (error) => {
      toast.error("Error creating interview. Please try again.");
      Sentry.withScope((scope) => {
        scope.setContext("params", params);
        Sentry.captureException(error);
      });
    },
  });

  const handleStartInterview = async () => {
    // Don't connect here - just create the interview and redirect
    // The interview page will handle the connection with proper context
    try {
      await createInterview({
        jobId: params.jobId as string,
        type: interviewToBeCreated.type,
        duration: interviewToBeCreated.duration,
        // Hume metadata will be populated later when connection is established
      });
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setContext("params", params);
        Sentry.captureException(error);
      });
      toast.error("Error starting interview. Please try again.");
    }
  };

  if (isLoading || isUserLoading) {
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

  const hasEnoughMinutes = user?.minutes && user.minutes >= (interviewToBeCreated?.duration || 0);
  const isDataBeingExtracted = !job?.data?.candidateDetails || !job?.data?.jobDescription;
  const canStartInterview = hasEnoughMinutes && !isDataBeingExtracted;

  return (
    <div className="h-full flex flex-col">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <div className="bg-background/40 backdrop-blur-md p-2 rounded-full border border-border/30 shadow-sm">
          <ThemeToggle />
        </div>
        <div className="bg-background/40 backdrop-blur-md p-2 rounded-full border border-border/30 shadow-sm">
          <Link href={`/dashboard/jobs/${jobId}/interviews`}>
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
                {interviewToBeCreated?.duration ? ` ${interviewToBeCreated.duration} minute` : ""}{" "}
                {interviewToBeCreated?.type
                  ? interviewToBeCreated.type.replace("_", " ")
                  : "practice"}{" "}
                interview
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
            <InterviewSettings
              interviewToBeCreated={interviewToBeCreated}
              setInterviewToBeCreated={setInterviewToBeCreated}
            />
          </motion.div>

          {/* Start Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-col items-center gap-2"
          >
            <Button
              size="lg"
              onClick={() => setShowModal(true)}
              disabled={!canStartInterview}
              className="relative group px-8 py-6 text-lg hover:scale-105 transition-transform"
            >
              <MessageCircle className="mr-2 h-5 w-5 group-hover:animate-wiggle" />
              {isDataBeingExtracted ? "Preparing Interview..." : "Start Interview"}
            </Button>
            {isDataBeingExtracted && (
              <p className="text-xs text-muted-foreground text-center max-w-xs">
                Extracting candidate details and job information...
              </p>
            )}
            {!hasEnoughMinutes && !isDataBeingExtracted && (
              <p className="text-xs text-destructive font-medium">Not enough minutes available</p>
            )}
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
        isLoading={isCreatingInterview}
        duration={interviewToBeCreated?.duration}
        availableMinutes={user?.minutes}
      />
    </div>
  );
}
