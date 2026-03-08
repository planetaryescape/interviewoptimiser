"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Github,
  Play,
  Shield,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useTheme } from "next-themes";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { useEffect, useState } from "react";
import { config } from "~/config";
import { BorderBeam } from "./magicui/border-beam";
import HeroVideoDialog from "./magicui/hero-video-dialog";
import Particles from "./magicui/particles";

const AVATAR_ITEMS = [
  {
    id: "avatar-1",
    className:
      "bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800",
  },
  {
    id: "avatar-2",
    className:
      "bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800",
  },
  {
    id: "avatar-3",
    className:
      "bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800",
  },
  {
    id: "avatar-4",
    className:
      "bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800",
  },
];

// Create a new component for the social proof part
const SocialProofContent = () => {
  noStore();
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
        {AVATAR_ITEMS.map((item) => (
          <div
            key={item.id}
            className={cn("w-8 h-8 rounded-full border-2 border-background", item.className)}
          />
        ))}
      </div>
      <p className="text-style-body-small">
        Join{" "}
        <span className="font-bold text-style-body-small">
          {statistics?.usersCount?.toLocaleString() ?? "our"} users
        </span>{" "}
        who have spent over{" "}
        <span className="font-bold text-style-body-small">
          {statistics?.minutesCount?.toLocaleString() ?? "many"} minutes
        </span>{" "}
        mastering their interview skills
      </p>
    </div>
  );
};

const SocialProofSkeleton = () => (
  <div className="flex items-center gap-4 text-muted-foreground">
    <div className="flex -space-x-2">
      {AVATAR_ITEMS.map((item) => (
        <div
          key={item.id}
          className={cn(
            "w-8 h-8 rounded-full border-2 border-background animate-pulse",
            item.className
          )}
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
  const [isHoveredPrimary, setIsHoveredPrimary] = useState(false);

  useEffect(() => {
    setColor(theme === "dark" ? "#ffffff" : "#000000");
  }, [theme]);

  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col justify-center">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex flex-col items-center text-center">
          <div className="space-y-8 w-full">
            {/* Badges */}
            <div className="flex flex-col items-center gap-3">
              <Link
                href={config.githubUrl}
                target="_blank"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground border border-border/50 hover:bg-muted hover:text-foreground transition-colors text-xs font-medium"
              >
                <Github size={14} />
                <span>Open Source</span>
              </Link>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mx-auto">
                <Sparkles size={16} className="animate-pulse" />
                <span className="text-sm font-medium">Land Your Dream Job 3x Faster</span>
              </div>
            </div>

            {/* Headline and copy */}
            <div className="space-y-6 max-w-6xl mx-auto">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
                Walk Into Any Interview With{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                  Unshakeable Confidence
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto">
                Practice with an interviewer who knows exactly what hiring managers want to hear.
                Get hired in weeks, not months—while others are still sending resumes.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-primary hover:bg-primary/90 text-white px-8 font-semibold"
                asChild
                onMouseEnter={() => setIsHoveredPrimary(true)}
                onMouseLeave={() => setIsHoveredPrimary(false)}
              >
                {userId ? (
                  <Link href="/dashboard/create" className="inline-flex items-center gap-2">
                    Start Your Practice Interview Now
                    <ArrowRight
                      className={cn(
                        "w-4 h-4 transition-transform duration-300",
                        isHoveredPrimary ? "translate-x-1" : ""
                      )}
                    />
                  </Link>
                ) : (
                  <Link href="/sign-up" className="inline-flex items-center gap-2">
                    Get Interview-Ready Today
                    <ArrowRight
                      className={cn(
                        "w-4 h-4 transition-transform duration-300",
                        isHoveredPrimary ? "translate-x-1" : ""
                      )}
                    />
                  </Link>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="font-semibold group relative overflow-hidden"
                asChild
              >
                <Link href="#how-it-works" className="inline-flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Watch 2-Min Demo
                </Link>
              </Button>
            </div>

            {/* Value Props - What You Get */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
              <div className="flex items-center gap-2 justify-center text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm">No More Interview Anxiety</span>
              </div>
              <div className="flex items-center gap-2 justify-center text-muted-foreground">
                <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm">Ready in 30 Minutes</span>
              </div>
              <div className="flex items-center gap-2 justify-center text-muted-foreground">
                <Trophy className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm">85% Pass Their Interviews</span>
              </div>
              <div className="flex items-center gap-2 justify-center text-muted-foreground">
                <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm">Know What They&apos;ll Ask</span>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex justify-center pt-4">
              <SocialProofContent />
            </div>

            {/* Video Section */}
            <div className="w-full mt-12">
              <div className="relative z-10 max-w-6xl mx-auto">
                <HeroVideoDialog
                  className="dark:hidden block w-full max-h-[550px] aspect-[16/9]"
                  animationStyle="from-center"
                  videoSrc="https://www.youtube.com/embed/8dVE_2VNR38?si=F3MQPSx6HQ4T9NpQ"
                  thumbnailSrc="/hero-video-thumbnail.png"
                  thumbnailAlt="Hero Video"
                />
                <HeroVideoDialog
                  className="hidden dark:block w-full max-h-[550px] aspect-[16/9]"
                  animationStyle="from-center"
                  videoSrc="https://www.youtube.com/embed/8dVE_2VNR38?si=F3MQPSx6HQ4T9NpQ"
                  thumbnailSrc="/hero-video-thumbnail.png"
                  thumbnailAlt="Hero Video"
                />
                <BorderBeam />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Particles className="absolute inset-0 -z-10" quantity={150} staticity={30} color={color} />

      <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/40 to-purple-500/40 blur-3xl opacity-20" />
      <div className="absolute bottom-0 left-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-pink-500/40 to-primary/40 blur-3xl opacity-20" />
    </div>
  );
}
