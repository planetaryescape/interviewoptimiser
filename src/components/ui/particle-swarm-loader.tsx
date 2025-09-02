"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ParticleProps {
  id: number;
  x: number;
  y: number;
  size: number;
}

export const ParticleSwarmLoader = ({ className }: { className?: string }) => {
  const [particles, setParticles] = useState<ParticleProps[]>([]);
  const particleCount = 50;

  useEffect(() => {
    setParticles(
      Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        size: Math.random() * 4 + 2,
      }))
    );
  }, []);

  return (
    <div
      className={cn(
        "h-50 w-50 text-primary overflow-hidden rounded-full bg-transparent",
        className
      )}
    >
      <svg width="100%" height="100%" viewBox="-100 -100 200 200">
        <title>Loading animation with swirling particles</title>
        {particles.map((particle) => (
          <motion.circle
            key={particle.id}
            cx={particle.x}
            cy={particle.y}
            r={particle.size}
            fill="currentColor"
            className="text-foreground"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0],
              cx: [particle.x, 0, particle.x],
              cy: [particle.y, 0, particle.y],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </svg>
    </div>
  );
};
