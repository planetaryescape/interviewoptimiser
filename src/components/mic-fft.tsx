"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AutoSizer } from "react-virtualized";

export function MicFFT({
  fft,
  className,
}: {
  fft: number[];
  className?: string;
}) {
  return (
    <div className={"relative size-full"}>
      <AutoSizer>
        {({ width, height }) => (
          <motion.svg
            viewBox={`0 0 ${width} ${height}`}
            width={width}
            height={height}
            className={cn("absolute !inset-0 !size-full", className)}
          >
            <title>Audio Frequency Visualization</title>
            {Array.from({ length: 24 }).map((_, index) => {
              const value = (fft[index] ?? 0) / 4;
              const h = Math.min(Math.max(height * value, 2), height);
              return (
                <motion.rect
                  key={`fft-bar-${index + 1}-${h}`}
                  height={h}
                  width={2}
                  x={index * 4}
                  y={height - h}
                  fill="currentColor"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.15, delay: index * 0.02 }}
                />
              );
            })}
          </motion.svg>
        )}
      </AutoSizer>
    </div>
  );
}
