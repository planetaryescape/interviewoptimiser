"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedStatCardProps {
  title: string;
  value: string | number;
  Icon: LucideIcon;
  description?: string;
  className?: string;
  valueClassName?: string;
}

export const AnimatedStatCard = ({
  title,
  value,
  Icon,
  description,
  className,
  valueClassName,
}: AnimatedStatCardProps) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      whileHover={{ y: -5, boxShadow: "0px 10px 20px hsla(var(--shadow-color), 0.1)" }}
      className={cn(
        "relative overflow-hidden group p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300",
        "bg-card border border-border/20 dark:border-border/30",
        "hover:border-primary/30 dark:hover:border-primary/40",
        className
      )}
    >
      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-30 dark:group-hover:opacity-20 transition-opacity duration-400" />

      {/* Decorative shape in corner */}
      <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary/5 dark:bg-primary/10 rounded-full blur-lg transform transition-all duration-500 ease-in-out group-hover:scale-125 group-hover:bg-primary/15 dark:group-hover:bg-primary/20 opacity-70 group-hover:opacity-100" />

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </h3>
            <Icon className="h-6 w-6 text-primary/70 group-hover:text-primary transition-colors" />
          </div>
          <p
            className={cn(
              "text-3xl md:text-4xl font-bold text-foreground group-hover:text-primary transition-colors",
              valueClassName
            )}
          >
            {value}
          </p>
        </div>
        {description && <p className="mt-3 text-xs text-muted-foreground/80">{description}</p>}
      </div>
    </motion.div>
  );
};
