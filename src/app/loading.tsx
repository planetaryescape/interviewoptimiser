import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";

export default function RootLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] grid place-items-center">
      <div className="flex flex-col items-center gap-4">
        <ParticleSwarmLoader />
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
