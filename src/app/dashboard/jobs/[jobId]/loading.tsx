import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";

export default function JobLoading() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <ParticleSwarmLoader />
        <p className="text-muted-foreground animate-pulse">Loading job...</p>
      </div>
    </div>
  );
}
