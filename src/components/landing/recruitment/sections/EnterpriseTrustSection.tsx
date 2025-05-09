"use client";

import { motion } from "framer-motion";
import { Server, Shield } from "lucide-react";
import SectionWrapper from "../ui/SectionWrapper";

export default function EnterpriseTrustSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  return (
    <SectionWrapper className="bg-muted/20">
      <motion.div
        className="max-w-3xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
          {/* Compliance badges */}
          <motion.div className="flex flex-col items-center text-center" variants={itemVariants}>
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              whileInView={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              viewport={{ once: true }}
            >
              <Shield className="h-12 w-12 mb-4 text-primary" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">Enterprise Security</h3>
            <div className="flex flex-wrap justify-center gap-2">
              <motion.span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted"
                variants={badgeVariants}
              >
                SOC 2 Type II (In Progress)
              </motion.span>
              <motion.span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted"
                variants={badgeVariants}
              >
                GDPR Compliant
              </motion.span>
            </div>
          </motion.div>

          {/* ATS Integration */}
          <motion.div className="flex flex-col items-center text-center" variants={itemVariants}>
            <motion.div
              initial={{ rotate: 10, scale: 0.8 }}
              whileInView={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              viewport={{ once: true }}
            >
              <Server className="h-12 w-12 mb-4 text-primary" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">ATS Integration</h3>
            <div className="flex flex-wrap justify-center gap-2">
              <motion.span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted"
                variants={badgeVariants}
              >
                Greenhouse
              </motion.span>
              <motion.span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted"
                variants={badgeVariants}
              >
                Lever
              </motion.span>
              <motion.span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted"
                variants={badgeVariants}
              >
                Workday
              </motion.span>
            </div>
          </motion.div>
        </motion.div>

        <motion.p
          className="text-center text-muted-foreground mt-8"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          On‑premise AI inference and custom data residency options available for regulated
          industries and specific enterprise requirements.
        </motion.p>
      </motion.div>
    </SectionWrapper>
  );
}
