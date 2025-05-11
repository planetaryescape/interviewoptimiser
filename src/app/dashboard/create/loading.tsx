import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center w-full px-4 md:px-6 lg:px-8 py-16 mt-16 min-h-[calc(100vh-64px)]">
      <div className="bg-card/95 backdrop-blur-md rounded-xl shadow-xl border border-border/40 overflow-hidden w-full max-w-7xl p-8 flex flex-col items-center justify-center space-y-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <h3 className="text-xl font-medium">Loading interview creator...</h3>
          <p className="text-muted-foreground text-center max-w-md">
            We&apos;re preparing the interview creation tools for you.
          </p>
        </div>

        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
