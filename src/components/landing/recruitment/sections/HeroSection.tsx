"use client";

import { Button } from "@/components/ui/button";
import { CTA } from "@/lib/landing/recruitment/constants";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import SectionWrapper from "../ui/SectionWrapper";

export default function HeroSection() {
  const [isHoveredPrimary, setIsHoveredPrimary] = useState(false);
  const [isHoveredSecondary, setIsHoveredSecondary] = useState(false);

  return (
    <SectionWrapper className="min-h-[90vh] flex items-center py-24 md:py-32 overflow-hidden relative">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.1),transparent_50%)]" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left side - Copy */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Live, adaptive AI interviews—at any scale.
          </motion.h1>
          <motion.p
            className="text-xl text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Give every candidate a pressure‑tested conversation, cut hiring time in half, and
            surface talent your competitors miss.
          </motion.p>
          <motion.div
            className="flex flex-wrap gap-4 pt-4"
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
              <Link href={CTA.b2b.href}>
                <span className="relative z-10 flex items-center gap-2">
                  {CTA.b2b.label}
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
              asChild
            >
              <Link href="#">
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
              </Link>
            </Button>
          </motion.div>
          <motion.div
            className="pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.7 }}
          >
            <Link
              href="#"
              className="text-primary inline-flex items-center underline underline-offset-4 hover:text-primary/80"
            >
              Try our AI: 3‑min Interview (no sign‑up)
            </Link>
          </motion.div>
          <motion.div
            className="pt-2"
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

        {/* Right side - Visual */}
        <motion.div
          className="relative h-[400px] md:h-[500px]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-20" />

            {/* Animated elements */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-primary/20"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 0.9, 0.7],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />

            <motion.div
              className="absolute bottom-1/3 right-1/3 w-24 h-24 rounded-full bg-secondary/20"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                delay: 1,
              }}
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="flex flex-col items-center gap-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.7 }}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <p className="text-muted-foreground font-medium">See AI interviews in action</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
