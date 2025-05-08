"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BarChart3, FileUp, Link as LinkIcon, Trophy } from "lucide-react";
import SectionTitle from "../ui/SectionTitle";
import SectionWrapper from "../ui/SectionWrapper";

export default function HowItWorksSection() {
  const steps = [
    {
      id: "step-1",
      title: "Upload Job Description",
      description:
        "Our AI engine maps key competencies from your job description and auto‑builds a calibrated, role-specific question set in minutes.",
      icon: <FileUp className="h-8 w-8" />,
    },
    {
      id: "step-2",
      title: "Share Interview Link",
      description:
        "Candidates self‑serve their AI interview—any device, any time zone. No downloads, no scheduling chaos.",
      icon: <LinkIcon className="h-8 w-8" />,
    },
    {
      id: "step-3",
      title: "Review Rich Reports",
      description:
        "Your dashboard updates in real time with recordings, transcripts, and deep analytics. Compare candidates side-by-side.",
      icon: <BarChart3 className="h-8 w-8" />,
    },
    {
      id: "step-4",
      title: "Identify Top Talent & Export",
      description:
        "Intelligent scorecards auto‑rank top performers. One‑click export of all data to your existing ATS/HRIS.",
      icon: <Trophy className="h-8 w-8" />,
    },
  ];

  return (
    <SectionWrapper className="bg-muted/20 relative overflow-hidden" id="how-it-works">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <motion.div
          className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-primary/5 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <SectionTitle>How It Works</SectionTitle>
      </motion.div>

      <div className="mt-12 space-y-12">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            className="flex flex-col md:flex-row gap-6 md:gap-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <div className="md:w-16 flex flex-row md:flex-col items-center">
              <motion.div
                className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                animate={
                  index === 0
                    ? {
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(var(--primary), 0.2)",
                          "0 0 0 8px rgba(var(--primary), 0)",
                          "0 0 0 0 rgba(var(--primary), 0)",
                        ],
                      }
                    : {}
                }
                transition={{
                  duration: 2,
                  repeat: index === 0 ? Number.POSITIVE_INFINITY : 0,
                  repeatType: "loop",
                }}
              >
                {step.icon}
              </motion.div>
              {index < steps.length - 1 && (
                <motion.div
                  className="hidden md:block h-full w-px bg-border mx-auto my-4"
                  initial={{ height: 0 }}
                  whileInView={{ height: "100%" }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                />
              )}
            </div>
            <motion.div
              className="flex-1"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <h3 className="text-xl font-semibold mb-2">
                <span className="text-primary">Step {index + 1}:</span> {step.title}
              </h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Button variant="outline" className="relative overflow-hidden group">
          <span className="relative z-10">View Sample Scorecard</span>
          <span className="absolute inset-0 bg-primary/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">
          See an anonymised example of our detailed candidate reports
        </p>
      </motion.div>
    </SectionWrapper>
  );
}
