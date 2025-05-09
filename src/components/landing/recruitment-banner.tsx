import { Button } from "@/components/ui/button";
import Link from "next/link";

export function RecruitmentBanner() {
  return (
    <div className="relative w-full overflow-hidden py-3">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-blue-600/80 via-purple-600/70 to-indigo-700/80 animate-[gradient_15s_ease_infinite]"
        style={{
          backgroundSize: "200% 200%",
          animation: "gradient 15s ease infinite",
        }}
      />
      <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10" />

      {/* Subtle animated elements */}
      <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-secondary/40 to-primary/20 blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
      <div className="absolute left-1/4 bottom-0 w-40 h-40 rounded-full bg-gradient-to-tr from-blue-400/30 to-transparent blur-2xl animate-[pulse_6s_ease-in-out_infinite_1s]" />

      {/* Banner content */}
      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-row items-center justify-between gap-4">
          <p className="text-white font-medium text-sm md:text-base">
            <span className="font-bold">✨ Are you a hiring manager or recruiter? ✨</span> Cut
            screening time by 80% with AI-powered interviews
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="whitespace-nowrap shadow-md hover:shadow-lg transition-all duration-300 animate-[breathe_10s_ease-in-out_infinite] text-xs md:text-sm"
            asChild
          >
            <Link href="/recruitment">Learn More ✨</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
