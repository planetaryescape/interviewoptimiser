"use client";

import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

export function ShortInterviewTakeover({ jobId }: { jobId: string }) {
  const deletedRef = useRef(false);
  const params = useParams();

  const deleteShortInterviewMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/interviews/${params.interviewId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete interview");
      }
    },
  });

  useEffect(() => {
    if (!deletedRef.current) {
      deleteShortInterviewMutation.mutate();
      deletedRef.current = true;
    }
  }, [deleteShortInterviewMutation]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      {/* Background Pattern */}
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

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-card/50 backdrop-blur-sm border border-primary/10 p-8 rounded-2xl shadow-2xl max-w-2xl w-full"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="bg-amber-100 dark:bg-amber-950/30 rounded-full p-4 mb-6">
              <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-500" />
            </div>
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 bg-clip-text text-transparent">
              Interview Too Short
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              The interview was too short for us to generate a meaningful analysis. Please restart
              the interview and spend at least 3 minutes.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8"
        >
          <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </Button>

          <Button className="w-full sm:w-auto flex items-center gap-2" asChild>
            <Link href={`/dashboard/jobs/${jobId}/interviews/new`}>
              <RefreshCw className="w-4 h-4" />
              Start a New Interview
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
