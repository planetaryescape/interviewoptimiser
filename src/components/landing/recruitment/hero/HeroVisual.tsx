"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface AnimationData {
  v: string;
  fr: number;
  ip: number;
  op: number;
  w: number;
  h: number;
  nm: string;
  ddd: number;
  assets: any[];
  layers: any[];
  markers: any[];
}

export default function HeroVisual() {
  const [animationData, setAnimationData] = useState<AnimationData | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionPreferenceChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleMotionPreferenceChange);

    // Load animation data
    const loadAnimationData = async () => {
      try {
        // In a production environment with proper bundling, this would work
        // Here we need to handle potential import issues
        try {
          // This path assumes the file exists in public/animations/
          const response = await fetch("/animations/hero-animation.lottie.json");
          const data = await response.json();
          setAnimationData(data);
        } catch (fetchError) {
          console.error("Failed to fetch animation data", fetchError);
        }
      } catch (error) {
        console.error("Failed to load animation data", error);
        // Animation data loading failed, we'll fall back to static visual
      }
    };

    if (!prefersReducedMotion) {
      loadAnimationData();
    }

    return () => {
      mediaQuery.removeEventListener("change", handleMotionPreferenceChange);
    };
  }, [prefersReducedMotion]);

  return (
    <motion.div
      className="relative w-full aspect-[16/9] max-h-[450px] md:max-h-[550px] rounded-xl shadow-lg border border-border/30 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.7 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-200/50 dark:from-primary/20 dark:to-purple-900/30 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />

        {!prefersReducedMotion && animationData ? (
          // If animation data is loaded and user doesn't prefer reduced motion, show Lottie
          <div className="w-full h-full">
            {/* @ts-ignore - Type issues with dynamic import */}
            <Lottie
              animationData={animationData}
              loop
              autoplay
              style={{ width: "100%", height: "100%" }}
              aria-label="Animated visualization of AI interviews"
            />
          </div>
        ) : (
          // Fallback static visual or animation for users with prefers-reduced-motion
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Left side element - Chat bubbles or sound waves */}
            <motion.div
              className="absolute left-[10%] top-1/2 transform -translate-y-1/2 flex flex-col gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="w-32 h-12 rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-sm p-2 flex items-center">
                <div className="w-6 h-6 rounded-full bg-primary/30 mr-2" />
                <div className="h-2 w-16 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>
              <div className="w-44 h-12 rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-sm p-2 flex items-center ml-6">
                <div className="w-6 h-6 rounded-full bg-primary/30 mr-2" />
                <div className="h-2 w-28 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>
              <div className="w-36 h-12 rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-sm p-2 flex items-center">
                <div className="w-6 h-6 rounded-full bg-primary/30 mr-2" />
                <div className="h-2 w-20 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>
            </motion.div>

            {/* Center element - Play button or highlight */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 shadow-lg">
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                  aria-labelledby="microphone-icon-title"
                  animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1] }}
                  transition={
                    prefersReducedMotion ? {} : { duration: 2, repeat: Number.POSITIVE_INFINITY }
                  }
                >
                  <title id="microphone-icon-title">Microphone Icon</title>
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </motion.svg>
              </div>
              <p className="text-sm font-medium">AI-Powered Conversations</p>
            </motion.div>

            {/* Right side element - Analytics or report visualization */}
            <motion.div
              className="absolute right-[10%] top-1/2 transform -translate-y-1/2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              <div className="w-40 h-36 rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-sm p-3 flex flex-col justify-between">
                <div className="w-full flex justify-between items-center mb-2">
                  <div className="h-2 w-14 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  <div className="h-4 w-4 rounded-full bg-primary/50" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-green-500 dark:bg-green-600 rounded-full"
                      style={{ width: "70%" }}
                      animate={prefersReducedMotion ? {} : { width: ["65%", "75%", "65%"] }}
                      transition={
                        prefersReducedMotion
                          ? {}
                          : { duration: 3, repeat: Number.POSITIVE_INFINITY }
                      }
                    />
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-500 dark:bg-amber-600 rounded-full"
                      style={{ width: "85%" }}
                      animate={prefersReducedMotion ? {} : { width: ["80%", "90%", "80%"] }}
                      transition={
                        prefersReducedMotion
                          ? {}
                          : { duration: 3.5, repeat: Number.POSITIVE_INFINITY, delay: 0.3 }
                      }
                    />
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-purple-500 dark:bg-purple-600 rounded-full"
                      style={{ width: "60%" }}
                      animate={prefersReducedMotion ? {} : { width: ["55%", "65%", "55%"] }}
                      transition={
                        prefersReducedMotion
                          ? {}
                          : { duration: 4, repeat: Number.POSITIVE_INFINITY, delay: 0.6 }
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <div className="h-4 w-4 rounded-sm bg-primary/30" />
                  <div className="h-4 w-10 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Decorative elements */}
        <motion.div
          className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-purple-500/10"
          animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={prefersReducedMotion ? {} : { duration: 7, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.div
          className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-primary/10"
          animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={
            prefersReducedMotion ? {} : { duration: 5, repeat: Number.POSITIVE_INFINITY, delay: 1 }
          }
        />
      </div>
    </motion.div>
  );
}
