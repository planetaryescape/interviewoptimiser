"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import Link from "next/link";
import SectionTitle from "../ui/SectionTitle";
import SectionWrapper from "../ui/SectionWrapper";

export default function ProblemSolutionSection() {
  const problems = [
    { id: "problem-1", text: "Keyword screens miss high‑potential talent." },
    { id: "problem-2", text: "Interview scheduling blocks your pipeline." },
    {
      id: "problem-3",
      text: "One‑way video feels staged, yields thin insight.",
    },
    { id: "problem-4", text: "High costs & time drain for initial screening." },
  ];

  const solutions = [
    {
      id: "solution-1",
      text: "Interview every applicant—no CV filter required.",
    },
    {
      id: "solution-2",
      text: "Zero calendar friction—candidates click a link, talk anytime.",
    },
    {
      id: "solution-3",
      text: "Our proven adaptive dialogue (refined over 759+ practice sessions) reveals true thinking under pressure.",
    },
    {
      id: "solution-4",
      text: "Slash screening costs & free up your recruiters.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <SectionWrapper className="bg-muted/20 relative overflow-hidden" id="features">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <motion.div
          className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-primary/5 blur-3xl"
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
        <motion.div
          className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-red-500/5 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            delay: 2,
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <SectionTitle>The "Shift-Left" Advantage</SectionTitle>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
        {/* Problems column */}
        <div className="space-y-6">
          <motion.h3
            className="text-xl font-semibold mb-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            Common Pain Points
          </motion.h3>
          <motion.ul
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {problems.map((problem) => (
              <motion.li
                key={problem.id}
                className="flex items-start gap-3 hover-lift"
                variants={itemVariants}
              >
                <div className="mt-1 bg-red-100 dark:bg-red-950/30 p-1 rounded-full text-red-600 dark:text-red-400">
                  <X className="h-4 w-4" />
                </div>
                <span>{problem.text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* Solutions column */}
        <div className="space-y-6">
          <motion.h3
            className="text-xl font-semibold mb-6"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            The Interview Optimiser Solution
          </motion.h3>
          <motion.ul
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {solutions.map((solution) => (
              <motion.li
                key={solution.id}
                className="flex items-start gap-3 hover-lift"
                variants={itemVariants}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-950/30 p-1 rounded-full text-green-600 dark:text-green-400">
                  <Check className="h-4 w-4" />
                </div>
                <span>{solution.text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>

      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Link
          href="#how-it-works"
          className="text-primary inline-flex items-center hover:underline group"
        >
          See How It Works
          <motion.span
            className="inline-block ml-1"
            animate={{ x: [0, 4, 0] }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          >
            →
          </motion.span>
        </Link>
      </motion.div>
    </SectionWrapper>
  );
}
