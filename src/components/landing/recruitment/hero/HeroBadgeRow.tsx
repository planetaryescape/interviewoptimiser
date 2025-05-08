import { motion } from "framer-motion";

interface StatCardProps {
  count: string;
  label: string;
  delay?: number;
}

function StatCard({ count, label, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      className="flex flex-col items-center px-4 py-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay + 0.2, duration: 0.5 }}
    >
      <span className="font-bold text-lg md:text-xl">{count}</span>
      <span className="text-xs md:text-sm text-muted-foreground text-center">{label}</span>
    </motion.div>
  );
}

// These would ideally come from an API or constants file
const STATS = {
  INTERVIEWS_CONDUCTED: "759+",
  MINUTES_LOGGED: "721+",
  PROFESSIONALS_SERVED: "120+",
};

export default function HeroBadgeRow() {
  return (
    <motion.div
      className="w-full mt-8 md:mt-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.7 }}
    >
      <div className="text-center mb-2 text-sm font-medium text-muted-foreground">
        Our AI: Proven & Engaging
      </div>
      <div className="flex flex-wrap justify-center items-center gap-2 md:gap-8">
        <StatCard count={STATS.INTERVIEWS_CONDUCTED} label="AI Interviews Conducted" delay={0} />
        <div className="hidden md:block h-10 w-px bg-border" aria-hidden="true" />
        <StatCard
          count={STATS.MINUTES_LOGGED}
          label="Minutes of Adaptive Dialogue Logged"
          delay={0.2}
        />
        <div className="hidden md:block h-10 w-px bg-border" aria-hidden="true" />
        <StatCard
          count={STATS.PROFESSIONALS_SERVED}
          label="Professionals Advancing Their Careers"
          delay={0.4}
        />
      </div>
    </motion.div>
  );
}
