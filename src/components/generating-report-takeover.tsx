import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { motion } from "framer-motion";
import { FileText, Sparkles, Target } from "lucide-react";

export function GeneratingReportTakeover() {
  const steps = [
    {
      icon: Target,
      title: "Analyzing Performance",
      description: "Evaluating your responses and communication style",
    },
    {
      icon: Sparkles,
      title: "Generating Insights",
      description: "Creating personalized feedback and recommendations",
    },
    {
      icon: FileText,
      title: "Preparing Report",
      description: "Compiling your comprehensive interview assessment",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/10 blur-3xl"
            style={{
              width: Math.random() * 400 + 200,
              height: Math.random() * 400 + 200,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, 30, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-card/50 backdrop-blur-sm border border-primary/10 p-8 rounded-2xl shadow-2xl max-w-2xl w-full"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Generating Your Report
            </h2>
            <p className="text-muted-foreground">
              Please wait while we analyze your interview performance
            </p>
          </motion.div>
        </div>

        <div className="relative mb-8">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted" />
          <div className="relative z-10 grid grid-cols-3 gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.2 }}
                className="flex flex-col items-center text-center"
              >
                <div className="bg-card shadow-lg rounded-full p-3 mb-4">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-sm font-medium mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center items-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
            <ParticleSwarmLoader />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          You&apos;ll be redirected automatically when your report is ready
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
