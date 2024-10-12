import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { motion } from "framer-motion";

export function ProcessingTakeover() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card text-card-foreground p-6 rounded-lg shadow-lg text-center"
      >
        <h2 className="text-2xl font-bold mb-4">Processing Your CV</h2>
        <div className="mb-6 flex justify-center items-center">
          <ParticleSwarmLoader />
        </div>
        <p className="mb-4">
          We&apos;re optimising your CV. This usually takes about a minute.
          You&apos;ll be redirected to the dashboard in a moment.
        </p>
        <p className="text-sm text-muted-foreground">
          Your CV optimisation will continue processing in the background.
        </p>
        <p className="text-sm text-muted-foreground">
          You&apos;ll see a &quot;View CV&quot; button on your optimisation in
          the dashboard when it&apos;s ready.
        </p>
      </motion.div>
    </motion.div>
  );
}
