"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CTA_BOOK_A_DEMO } from "@/lib/landing/recruitment/constants";
import { cn } from "@/lib/utils";

interface HeroCopyProps {
  onOpenDemoModal: () => void;
  centerAligned?: boolean;
}

export default function HeroCopy({ onOpenDemoModal, centerAligned = false }: HeroCopyProps) {
  const [isHoveredPrimary, setIsHoveredPrimary] = useState(false);
  const [isHoveredSecondary, setIsHoveredSecondary] = useState(false);

  return (
    <motion.div
      className={cn("space-y-8", centerAligned && "text-center")}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className={cn(
          "text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight",
          centerAligned && "mx-auto max-w-6xl"
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.7 }}
      >
        Live, adaptive AI interviews—at any scale.
      </motion.h1>
      <motion.p
        className={cn(
          "text-xl md:text-2xl text-muted-foreground",
          centerAligned && "mx-auto max-w-3xl"
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.7 }}
      >
        Give every candidate a pressure‑tested conversation, cut hiring time in half, and surface
        talent your competitors miss.
      </motion.p>
      <motion.div
        className={cn("flex flex-wrap gap-4 pt-4", centerAligned && "justify-center")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.7 }}
      >
        <Button
          size="lg"
          asChild
          className="group relative overflow-hidden"
          onMouseEnter={() => setIsHoveredPrimary(true)}
          onMouseLeave={() => setIsHoveredPrimary(false)}
        >
          <Link href={CTA_BOOK_A_DEMO.href}>
            <span className="relative z-10 flex items-center gap-2">
              {CTA_BOOK_A_DEMO.text}
              <ArrowRight
                className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  isHoveredPrimary ? "translate-x-1" : ""
                )}
              />
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="group relative overflow-hidden"
          onMouseEnter={() => setIsHoveredSecondary(true)}
          onMouseLeave={() => setIsHoveredSecondary(false)}
          onClick={onOpenDemoModal}
        >
          <span className="relative z-10 flex items-center gap-2">
            <Play className="h-4 w-4" />
            Watch 60‑sec Demo
            <span
              className={cn(
                "absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300",
                isHoveredSecondary ? "w-full" : "w-0"
              )}
            />
          </span>
        </Button>
      </motion.div>
      <motion.div
        className={cn("pt-2", centerAligned && "flex justify-center")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.7 }}
      >
        <Link
          href={process.env.NEXT_PUBLIC_TRY_AI_PAGE_URL || "/try"}
          className="text-primary inline-flex items-center underline underline-offset-4 hover:text-primary/80"
        >
          Try our AI: 3‑min Interview (no sign‑up)
        </Link>
      </motion.div>
      <motion.div
        className={cn("pt-2", centerAligned && "flex justify-center")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.7 }}
      >
        <Link
          href="#candidate-zone"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Job Seeker? Practise your interview skills for free (15 mins daily) →
        </Link>
      </motion.div>
    </motion.div>
  );
}
