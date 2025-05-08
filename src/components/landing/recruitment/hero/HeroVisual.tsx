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
      className="relative h-[400px] md:h-[500px]"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.7 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />

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
            {/* Animated elements */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-primary/20"
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 0.9, 0.7],
                    }
              }
              transition={
                prefersReducedMotion
                  ? {}
                  : {
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    }
              }
            />

            <motion.div
              className="absolute bottom-1/3 right-1/3 w-24 h-24 rounded-full bg-secondary/20"
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }
              }
              transition={
                prefersReducedMotion
                  ? {}
                  : {
                      duration: 5,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                      delay: 1,
                    }
              }
            />

            <motion.div
              className="flex flex-col items-center gap-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.7 }}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
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
                  aria-labelledby="play-icon-title"
                >
                  <title id="play-icon-title">Play Icon</title>
                  <polygon points="5 3 19 12 5 21 5 3" />
                </motion.svg>
              </div>
              <p className="text-muted-foreground font-medium">See AI interviews in action</p>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
