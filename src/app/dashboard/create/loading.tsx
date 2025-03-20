import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";

export default function CreateInterviewLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ParticleSwarmLoader />
        <p className="text-muted-foreground animate-pulse">Preparing interview creation...</p>
      </div>
    </div>
  );
}
