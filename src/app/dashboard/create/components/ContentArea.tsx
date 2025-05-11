"use client";

import { Step1CV } from "@/components/create-optimization/Step1CV";
import { Step2JobDescription } from "@/components/create-optimization/Step2JobDescription";
import { Step3AdditionalInfo } from "@/components/create-optimization/Step3AdditionalInfo";
import { Button } from "@/components/ui/button";
import { useCreateInterviewStep } from "@/stores/createInterviewStore";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { Home, Layout } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ContentAreaProps {
  animationDir: number;
}

export function ContentArea({ animationDir }: ContentAreaProps) {
  const step = useCreateInterviewStep();
  const router = useRouter();
  const [contentHeight, setContentHeight] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();

  // Content mapping
  const stepContent = {
    1: <Step1CV />,
    2: <Step2JobDescription />,
    3: <Step3AdditionalInfo />,
  };

  // Define animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      zIndex: 1,
    }),
    visible: {
      x: 0,
      zIndex: 2,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? "-100%" : "100%",
      zIndex: 1,
    }),
  };

  const transition = {
    type: "spring",
    stiffness: 150,
    damping: 18,
    mass: 1.1,
    duration: 0.4,
    ease: [0.2, 0, 0.3, 1],
  };

  // Effect to measure and animate content height when step changes
  useEffect(() => {
    const updateHeight = () => {
      if (contentRef.current) {
        const newHeight = contentRef.current.scrollHeight;
        setContentHeight(newHeight);
        controls.start({ height: newHeight });
      }
    };

    // Initial measurement
    updateHeight();

    // Set up a mutation observer to detect content changes
    const observer = new MutationObserver(updateHeight);
    if (contentRef.current) {
      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    // Listen for window resize
    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [controls]);

  return (
    <div className="flex-1 flex flex-col justify-center items-center w-full px-4 md:px-6 lg:px-8 py-16 mt-16 min-h-[calc(100vh-64px)]">
      {/* Main content box */}
      <div className="bg-card/95 backdrop-blur-md rounded-xl shadow-xl border border-border/40 overflow-hidden w-full max-w-7xl animate-in fade-in slide-in-from-bottom-8 duration-500">
        <motion.div
          className="relative overflow-hidden"
          initial={{ height: "auto" }}
          animate={controls}
          transition={{
            height: {
              type: "spring",
              stiffness: 150,
              damping: 18,
              duration: 0.4,
            },
          }}
          style={{ minHeight: "calc(100vh - 300px)" }}
        >
          <AnimatePresence initial={false} custom={animationDir} mode="sync">
            <motion.div
              key={step}
              custom={animationDir}
              variants={slideVariants}
              initial="enter"
              animate="visible"
              exit="exit"
              transition={transition}
              className="w-full absolute top-0 left-0 right-0"
              ref={contentRef}
            >
              {stepContent[step as keyof typeof stepContent]}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 pt-6 border-t border-border/40 flex flex-wrap gap-4 justify-center w-full max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/")}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Home
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2"
        >
          <Layout className="h-4 w-4" />
          Dashboard
        </Button>
      </div>
    </div>
  );
}
