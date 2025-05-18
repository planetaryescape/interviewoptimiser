"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, type LucideIcon, Minus } from "lucide-react";

interface ScoreComparisonCardProps {
  title: string;
  Icon: LucideIcon;
  last3Score: number;
  allTimeScore: number;
  className?: string;
}

export const ScoreComparisonCard = ({
  title,
  Icon,
  last3Score,
  allTimeScore,
  className,
}: ScoreComparisonCardProps) => {
  const trend = last3Score > allTimeScore ? "up" : last3Score < allTimeScore ? "down" : "neutral";
  const difference = Math.abs(last3Score - allTimeScore);
  const percentageDifference =
    allTimeScore !== 0
      ? ((last3Score - allTimeScore) / allTimeScore) * 100
      : last3Score > 0
        ? 100
        : 0;

  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const trendColor =
    trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        { duration: 0.3, delay: Math.random() * 0.2 } // Stagger animation slightly
      }
      className={cn(
        "relative group p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300",
        "bg-card border border-border/20 dark:border-border/30",
        "hover:border-primary/20 dark:hover:border-primary/30",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </h4>
        <Icon className="h-5 w-5 text-primary/60 group-hover:text-primary/80 transition-colors" />
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
          {last3Score.toFixed(1)}
        </p>
        <p className="text-xs text-muted-foreground">(Last 3)</p>
      </div>

      <div className="flex items-center text-xs">
        <TrendIcon className={cn("h-3.5 w-3.5 mr-1", trendColor)} />
        <span className={cn("font-medium", trendColor)}>
          {trend !== "neutral" ? `${percentageDifference.toFixed(0)}%` : "No change"}
        </span>
        <span className="text-muted-foreground/80 ml-1">
          vs. All Time ({allTimeScore.toFixed(1)})
        </span>
      </div>
      {/* Decorative element */}
      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary/5 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
    </motion.div>
  );
};
