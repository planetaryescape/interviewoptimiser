"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useJob } from "@/hooks/useJob";
import { useUser } from "@/hooks/useUser";
import { getRepository } from "@/lib/data/repositoryFactory";
import { cn } from "@/lib/utils";
import { interviewTypes } from "@/utils/conversation_config";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Clock, PlusCircle, Settings } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { Job } from "~/db/schema";

export function InterviewSettings({
  isSaving,
  setIsSaving,
}: {
  isSaving: boolean;
  setIsSaving: (isSaving: boolean) => void;
}) {
  const params = useParams();
  const jobId = params.jobId as string;
  const { data: job } = useJob(jobId);
  const { data: user } = useUser();
  const queryClient = useQueryClient();

  const selectedInterviewType = job
    ? interviewTypes.find((type) => type.type === job.data.type)
    : interviewTypes.find((type) => type.type === "behavioral");

  const jobMutation = useMutation({
    mutationFn: async (job: Job) => {
      const jobRepo = await getRepository<Job>("jobs");
      return await jobRepo.update(jobId, job);
    },
    onSuccess: () => {
      setIsSaving(false);
      queryClient.invalidateQueries({ queryKey: ["job", jobId] });
    },
    onError: (error) => {
      Sentry.withScope((scope) => {
        scope.setLevel("error");
        Sentry.captureException(error);
      });
      toast.error("Failed to update interview type");
      setIsSaving(false);
      queryClient.invalidateQueries({ queryKey: ["job", jobId] });
    },
  });

  const [isExamplesExpanded, setIsExamplesExpanded] = useState(true);

  // Check if user has enough minutes for the selected duration
  const hasEnoughMinutes = user && job && user.minutes >= job.data.duration;

  const handleInterviewTypeChange = (value: string) => {
    setIsSaving(true);
    if (!job) return;

    jobMutation.mutate({
      ...job.data,
      id: job.sys.id || 0,
      type: value as any,
      duration: job.data.duration,
    });
  };

  const handleDurationChange = (value: string) => {
    setIsSaving(true);
    if (!job) return;
    jobMutation.mutate({
      ...job.data,
      id: job.sys.id || 0,
      type: job.data.type,
      duration: Number.parseInt(value),
    });
    // Simulate network request for optimistic update
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 w-full max-w-5xl">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Interview Settings Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Interview Settings</h3>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Choose the interview type and duration that best fits your needs
          </p>

          <div className="space-y-6">
            <div>
              <Label htmlFor="interview-type" className="text-sm font-medium mb-1.5 block">
                Interview Type
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Choose the interview style that best fits your goals
              </p>
              <Select
                value={selectedInterviewType?.type}
                onValueChange={handleInterviewTypeChange}
                disabled={isSaving}
              >
                <SelectTrigger id="interview-type" className="bg-background border-border">
                  <SelectValue placeholder="Select an interview type" />
                </SelectTrigger>
                <SelectContent>
                  {interviewTypes.map((type) => (
                    <SelectItem key={type.type} value={type.type}>
                      {type.type
                        .split("_")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="interview-duration" className="text-sm font-medium">
                  Duration
                </Label>

                {/* Minutes Display - Toned down with Top Up button */}
                {user && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1.5 py-1 px-2 rounded-md border border-border/60 bg-background/80">
                      <span className="text-xs text-muted-foreground">Available:</span>
                      <Badge
                        variant={hasEnoughMinutes ? "secondary" : "destructive"}
                        className="font-medium text-xs py-0 h-5"
                      >
                        {user.minutes} minutes
                      </Badge>
                    </div>
                    <Link
                      href="/pricing"
                      className="h-7 px-2 text-xs text-primary hover:text-primary/90 hover:bg-primary/5 cursor-pointer inline-flex items-center rounded-md"
                    >
                      <PlusCircle className="h-3.5 w-3.5 mr-1" />
                      Top up
                    </Link>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground mb-2">
                Longer interviews are more thorough but cost more minutes
              </p>
              <Select
                value={job?.data?.duration.toString() || "3"}
                onValueChange={handleDurationChange}
                disabled={isSaving}
              >
                <SelectTrigger
                  id="interview-duration"
                  className={cn(
                    "bg-background border-border",
                    !hasEnoughMinutes && "border-destructive/50 text-destructive"
                  )}
                >
                  <SelectValue placeholder="Select interview duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 minutes</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="20">20 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>

              {!hasEnoughMinutes && (
                <p className="text-destructive text-xs mt-1 flex items-center">
                  <span>You don&apos;t have enough minutes.</span>
                  <Link
                    href="/pricing"
                    className="ml-1 text-xs text-destructive hover:text-destructive/90 underline cursor-pointer"
                  >
                    Top up now
                  </Link>
                </p>
              )}
            </div>

            {/* Duration Guide */}
            <div className="bg-muted/30 rounded-lg border border-border/60 p-5">
              <div className="flex items-start gap-2.5 mb-4">
                <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-base">Duration Guide</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose a duration that matches your needs:
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/20 text-primary px-3 py-2 rounded w-[120px] text-center flex-shrink-0">
                    <span className="text-sm font-medium">3-5 min</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Quick practice with basic questions
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/20 text-primary px-3 py-2 rounded w-[120px] text-center flex-shrink-0">
                    <span className="text-sm font-medium">10-15 min</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Standard practice with more depth
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/20 text-primary px-3 py-2 rounded w-[120px] text-center flex-shrink-0">
                    <span className="text-sm font-medium">20-30 min</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Thorough preparation with detailed questions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div>
        {selectedInterviewType && (
          <div className="bg-muted/30 rounded-lg border border-border/60 overflow-hidden">
            <div className="p-5">
              <h4 className="font-medium text-base mb-2">
                About{" "}
                {selectedInterviewType.type
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}{" "}
                Interviews
              </h4>
              <p className="text-sm text-muted-foreground">{selectedInterviewType.description}</p>
            </div>

            <div className="border-t border-border/60 px-5 py-3">
              <button
                type="button"
                onClick={() => setIsExamplesExpanded(!isExamplesExpanded)}
                className="flex items-center text-sm font-medium text-primary"
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200 mr-1.5",
                    isExamplesExpanded ? "rotate-180" : ""
                  )}
                />
                {isExamplesExpanded ? "Hide" : "Show"} example questions
              </button>
            </div>

            <AnimatePresence>
              {isExamplesExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-border/60 overflow-hidden"
                >
                  <div className="px-5 py-3 space-y-3">
                    {selectedInterviewType.exampleQuestions.slice(0, 5).map((question, index) => (
                      <motion.div
                        key={`question-${question.slice(0, 20)}-${index}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-sm text-muted-foreground pl-3 border-l-2 border-primary/20"
                      >
                        {question}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
