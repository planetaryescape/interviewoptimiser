"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import Link from "next/link";
import SectionTitle from "../ui/SectionTitle";
import SectionWrapper from "../ui/SectionWrapper";

export default function RecruiterROIBand() {
  const roiData = [
    {
      metric: "Time‑to‑Hire",
      typical: "38 days",
      withIO: "24–28 days",
      improvement: "Up to 37%",
    },
    {
      metric: "Recruiter Hours / Hire",
      typical: "3.5 hrs",
      withIO: "< 0.4 hrs",
      improvement: "Over 80%",
    },
    {
      metric: "Candidate Experience",
      typical: "Variable",
      withIO: "Consistently Positive & Fair",
      improvement: "Enhanced Brand",
    },
  ];

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <SectionWrapper>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionTitle>Recruiter ROI</SectionTitle>
      </motion.div>

      <motion.div
        className="mt-8 overflow-x-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={tableVariants}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Typical Hiring Process</TableHead>
              <TableHead>With Interview Optimiser (Projected)</TableHead>
              <TableHead>Potential Improvement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roiData.map((row, index) => (
              <motion.tr key={row.metric} variants={rowVariants} custom={index}>
                <TableCell className="font-medium">{row.metric}</TableCell>
                <TableCell>{row.typical}</TableCell>
                <TableCell className="font-medium">{row.withIO}</TableCell>
                <TableCell className="font-medium text-primary">{row.improvement}</TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <p className="text-sm text-muted-foreground mb-4">
          Illustrative ROI based on typical hiring metrics and Interview Optimiser&apos;s automation
          capabilities. Let&apos;s estimate yours →
        </p>
        <Button asChild className="relative overflow-hidden group">
          <Link href="#contact-form">
            <motion.span
              className="absolute inset-0 bg-primary/10 transform origin-left"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
            Estimate My ROI
          </Link>
        </Button>
      </motion.div>
    </SectionWrapper>
  );
}
