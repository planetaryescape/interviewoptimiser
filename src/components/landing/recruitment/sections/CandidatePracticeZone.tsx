"use client";

import { Button } from "@/components/ui/button";
import { CTA } from "@/lib/landing/recruitment/constants";
import { motion } from "framer-motion";
import Link from "next/link";
import SectionWrapper from "../ui/SectionWrapper";

export default function CandidatePracticeZone() {
  const stats = [
    { value: "721+", label: "Minutes of Live Interview Practice Logged" },
    { value: "759+", label: "Adaptive AI Interviews Successfully Completed" },
    { value: "120+", label: "Career Journeys Enhanced Through Practice" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
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

  const statsVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.5,
      },
    },
  };

  const statItemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
      },
    },
  };

  return (
    <SectionWrapper className="bg-muted/30" id="candidate-zone">
      <motion.div
        className="max-w-3xl mx-auto text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.h2
          className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
          variants={itemVariants}
        >
          Job Seekers: Ace Your Next Interview – Practise for Free!
        </motion.h2>
        <motion.p className="text-lg text-muted-foreground mb-8" variants={itemVariants}>
          Join over <span className="font-medium">120+ individuals</span> who are already mastering
          their interview skills with our adaptive AI. Get{" "}
          <span className="font-medium">
            15 minutes of free, dynamic interview practice every day
          </span>
          . No catch, just real improvement.
        </motion.p>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12"
          variants={statsVariants}
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center"
              variants={statItemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.span
                className="text-3xl md:text-4xl font-bold text-primary mb-2"
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                {stat.value}
              </motion.span>
              <span className="text-sm text-muted-foreground text-center">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Button size="lg" asChild className="relative overflow-hidden">
            <Link href={CTA.b2c.href}>
              <motion.span
                className="absolute inset-0 bg-primary/10"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
              {CTA.b2c.label}
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </SectionWrapper>
  );
}
