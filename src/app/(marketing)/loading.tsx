import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";

export default function MarketingLoading() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 blur-3xl opacity-20" />
      </div>
      <div className="relative z-10 flex flex-col items-center space-y-4">
        <ParticleSwarmLoader />
        <p className="text-muted-foreground animate-pulse">
          Loading content...
        </p>
      </div>
    </div>
  );
}
