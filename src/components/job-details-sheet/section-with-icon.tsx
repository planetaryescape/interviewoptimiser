"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import * as React from "react";

interface SectionWithIconProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}

export const SectionWithIcon = React.memo(function SectionWithIcon({
  icon: Icon,
  title,
  children,
}: SectionWithIconProps) {
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
    <motion.div
      variants={itemVariants}
      className="border-b border-border pb-6 mb-6 last:border-0 last:mb-0 last:pb-0"
    >
      <div className="flex items-start">
        <div className="p-2 bg-accent rounded-md text-accent-foreground mr-4">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold mb-3 text-foreground">{title}</h3>
          {children}
        </div>
      </div>
    </motion.div>
  );
});
