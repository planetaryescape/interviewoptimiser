"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
import Particles from "./magicui/particles";

// Create a new component for the social proof part
const SocialProofContent = () => {
  const { data: response, isLoading } = useQuery({
    queryKey: ["statistics"],
    queryFn: async () => {
      const res = await fetch("/api/public/statistics");
      if (!res.ok) {
        throw new Error("Failed to fetch statistics");
      }
      return res.json();
    },
  });

  if (isLoading) {
    return <SocialProofSkeleton />;
  }

  const statistics = response?.data;

  return (
    <div className="flex items-center gap-4 text-muted-foreground">
      <div className="flex -space-x-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800"
          />
        ))}
      </div>
      <p className="text-sm">
        Join {statistics?.usersCount?.toLocaleString() ?? "our"} users who spent
        over {statistics?.minutesCount?.toLocaleString() ?? "many"} minutes
        mastering their interview skills
      </p>
    </div>
  );
};

const SocialProofSkeleton = () => (
  <div className="flex items-center gap-4 text-muted-foreground">
    <div className="flex -space-x-2">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800 animate-pulse"
        />
      ))}
    </div>
    <Skeleton className="h-5 w-64" />
  </div>
);

export function Hero() {
  const { userId } = useAuth();
  const { theme } = useTheme();
  const [color, setColor] = useState("#ffffff");

  useEffect(() => {
    setColor(theme === "dark" ? "#ffffff" : "#000000");
  }, [theme]);

  return (
    <div className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid lg:grid-cols-[2fr_1fr] gap-16 items-center">
          <div className="space-y-6 z-50 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Sparkles size={16} className="animate-pulse" />
              <span className="text-sm font-medium">
                AI-Powered Interview Mastery
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Real Voice AI Interviews with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                  Emotional Intelligence
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Experience true-to-life interview practice with voice-to-voice
                AI that adapts to your responses, analyzes your delivery, and
                provides personalized feedback on both what you say and how you
                say it.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                size="lg"
                className="font-semibold group relative overflow-hidden bg-primary hover:bg-primary/90 text-white px-8"
                asChild
              >
                {userId ? (
                  <Link
                    href="/dashboard/create"
                    className="inline-flex items-center gap-2"
                  >
                    Start Mock Interview
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center gap-2"
                  >
                    Try For Free
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="font-semibold group"
                asChild
              >
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </div>

            <SocialProofContent />
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-purple-500/30 to-pink-500/30 blur-3xl opacity-20 rounded-full" />
            <div className="relative bg-gradient-to-br from-background/80 to-background/20 backdrop-blur-sm border border-foreground/10 p-8 rounded-2xl">
              {/* You can add a demo video, animation, or illustration here */}
            </div>
          </div>
        </div>
      </div>

      <Particles
        className="absolute inset-0 -z-10"
        quantity={150}
        staticity={30}
        color={color}
      />

      <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/40 to-purple-500/40 blur-3xl opacity-20" />
      <div className="absolute bottom-0 left-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-pink-500/40 to-primary/40 blur-3xl opacity-20" />
    </div>
  );
}
