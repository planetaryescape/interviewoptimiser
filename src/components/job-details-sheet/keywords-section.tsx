"use client";

import { motion } from "framer-motion";
import * as React from "react";

interface KeywordsSectionProps {
  keywords: string[] | null;
}

export const KeywordsSection = React.memo(function KeywordsSection({
  keywords,
}: KeywordsSectionProps) {
  if (!keywords || keywords.length === 0) return null;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className="pt-4">
      <h3 className="text-sm font-semibold mb-3 text-foreground">Keywords</h3>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword: string) => (
          <motion.div
            key={keyword}
            variants={itemVariants}
            className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium"
          >
            {keyword}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});
