"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import SectionWrapper from "../ui/SectionWrapper";

export default function SocialProofBar() {
  const fadeInVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * custom,
        duration: 0.5,
      },
    }),
  };

  return (
    <SectionWrapper className="py-8 bg-muted/30 relative overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12">
        {/* Compliance badges */}
        <motion.div
          className="flex items-center gap-2 text-muted-foreground"
          variants={fadeInVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          custom={1}
        >
          <div className="relative">
            <Shield className="h-5 w-5" />
            <motion.span
              className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          </div>
          <span className="font-medium">SOC 2 Type II (In Progress)</span>
        </motion.div>

        <motion.div
          className="h-8 w-px bg-border hidden md:block"
          variants={fadeInVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          custom={2}
        />

        <motion.div
          className="flex items-center gap-2 text-muted-foreground"
          variants={fadeInVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          custom={3}
        >
          <Shield className="h-5 w-5" />
          <span className="font-medium">GDPR Compliant</span>
        </motion.div>

        <motion.div
          className="h-8 w-px bg-border hidden md:block"
          variants={fadeInVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          custom={4}
        />

        {/* User trust element */}
        <motion.div
          className="text-center md:text-left text-muted-foreground"
          variants={fadeInVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          custom={5}
        >
          <p className="font-medium">
            <motion.span
              className="text-primary"
              animate={{
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            >
              120+
            </motion.span>{" "}
            Professionals Trust Our AI to Sharpen Their Interview Skills
          </p>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
