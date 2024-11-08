"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 blur-3xl opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8 text-center">
        {/* 404 Number */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
          <h1 className="relative text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            404
          </h1>
        </div>

        {/* Icon */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-xl animate-pulse" />
          <AlertTriangle className="relative w-16 h-16 text-orange-500" />
        </div>

        {/* Text Content */}
        <div className="space-y-4 max-w-md">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Page Not Found
          </h2>
          <p className="text-lg text-muted-foreground">
            Oops! It seems like the page you&apos;re looking for doesn&apos;t
            exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
          >
            <Link href="/">Go to Homepage</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>

        {/* Decorative Bottom Element */}
        <svg
          className="w-64 h-2 mt-8"
          viewBox="0 0 256 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="0"
            y1="4"
            x2="256"
            y2="4"
            stroke="url(#gradient)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <animate
              attributeName="stroke-dasharray"
              values="0,256;256,0"
              dur="2s"
              repeatCount="indefinite"
            />
          </line>
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop
                offset="100%"
                stopColor="var(--primary)"
                stopOpacity="0.2"
              />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
