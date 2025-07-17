"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { SectionWithIcon } from "./section-with-icon";

interface ListSectionProps {
  items: string[] | null;
  icon: LucideIcon;
  title: string;
  emptyMessage?: string;
}

export const ListSection = React.memo(function ListSection({
  items,
  icon,
  title,
  emptyMessage = "Not specified",
}: ListSectionProps) {
  const formatList = (list: string[] | null) => {
    if (!list || list.length === 0) return [emptyMessage];
    return list;
  };

  const formattedItems = formatList(items);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const listItemVariants = {
    hidden: { x: -10, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 500,
        damping: 30,
      },
    },
  };

  return (
    <SectionWithIcon icon={icon} title={title}>
      <motion.ul
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        {formattedItems.map((item: string) => (
          <motion.li
            key={`${title}-${item}`}
            variants={listItemVariants}
            className="flex items-start"
          >
            <ChevronRight className="w-4 h-4 text-accent-foreground mt-0.5 mr-2 flex-shrink-0" />
            <span className="text-sm text-muted-foreground">{item}</span>
          </motion.li>
        ))}
      </motion.ul>
    </SectionWithIcon>
  );
});
