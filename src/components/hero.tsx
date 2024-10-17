"use client";

import { Button } from "@/components/ui/button";
import { config } from "@/lib/config";
import { useAuth } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
import Particles from "./magicui/particles";

export function Hero() {
  const { userId } = useAuth();
  const { theme } = useTheme();
  const [color, setColor] = useState("#ffffff");

  useEffect(() => {
    setColor(theme === "dark" ? "#ffffff" : "#000000");
  }, [theme]);

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 z-50">
          <h1 className="text-4xl md:text-5xl font-bold text-[#333] dark:text-white leading-tight">
            {config.projectName}: Your AI Interview Coach
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300">
            Ace your next interview with personalized AI-powered practice
            sessions.
          </p>
          <Button
            size="lg"
            className="font-bold animate-buttonheartbeat bg-gradient-to-r from-primary/90 via-primary/50 to-primary/90 text-white px-24 w-full md:w-auto"
            asChild
            variant="default"
          >
            {userId ? (
              <Link href="/dashboard/create">Start Your Mock Interview</Link>
            ) : (
              <Link href="/sign-up">Get Started for Free</Link>
            )}
          </Button>
        </div>
      </div>
      <Particles
        className="absolute inset-0 -z-10"
        quantity={100}
        staticity={30}
        color={color}
      />
    </div>
  );
}
