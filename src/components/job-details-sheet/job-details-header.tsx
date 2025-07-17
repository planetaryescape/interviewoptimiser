"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import * as React from "react";

interface JobDetailsHeaderProps {
  onClose: () => void;
}

export const JobDetailsHeader = React.memo(function JobDetailsHeader({
  onClose,
}: JobDetailsHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-10 border-b border-border bg-card py-4 px-6"
    >
      <div className="flex justify-between items-center">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-semibold tracking-tight text-card-foreground"
        >
          Job Description
        </motion.h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
    </motion.div>
  );
});
