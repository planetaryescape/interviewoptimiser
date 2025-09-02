"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { FileText } from "lucide-react";
import * as React from "react";
import { JobDetailsContent } from "./job-details-content";
import { JobDetailsHeader } from "./job-details-header";
import { useJobDetails } from "./use-job-details";

type JobDetailsSheetProps = {
  jobId: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
};

export const JobDetailsSheet = React.memo(function JobDetailsSheet({
  jobId,
  className,
  variant = "outline",
}: JobDetailsSheetProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { data, isLoading, error } = useJobDetails(jobId, isOpen);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant={variant} className={className}>
          <FileText className="w-4 h-4 mr-2" />
          View Job Details
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-card p-0" side="right">
        <MotionConfig
          transition={{
            type: "spring" as const,
            stiffness: 300,
            damping: 30,
          }}
        >
          <AnimatePresence>
            <div className="h-full flex flex-col">
              <JobDetailsHeader onClose={() => setIsOpen(false)} />
              <div className="flex-1 overflow-y-auto p-6 bg-card text-card-foreground">
                <JobDetailsContent
                  data={data}
                  isLoading={isLoading}
                  error={error}
                  onClose={() => setIsOpen(false)}
                />
              </div>
            </div>
          </AnimatePresence>
        </MotionConfig>
      </SheetContent>
    </Sheet>
  );
});
