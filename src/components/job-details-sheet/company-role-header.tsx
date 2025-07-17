"use client";

import { motion } from "framer-motion";
import { Building, Clock, Diamond, MapPin } from "lucide-react";
import * as React from "react";
import type { JobDescription } from "~/db/schema";

interface CompanyRoleHeaderProps {
  jobData: JobDescription;
}

export const CompanyRoleHeader = React.memo(function CompanyRoleHeader({
  jobData,
}: CompanyRoleHeaderProps) {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-6"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring" as const,
          stiffness: 300,
          damping: 25,
          delay: 0.1,
        }}
        className="bg-white dark:bg-gray-900 rounded-lg px-4 py-3 mb-4 inline-block"
      >
        <motion.span className="text-sm font-medium text-blue-600 dark:text-blue-400">
          {jobData.company || "Company"}
        </motion.span>
      </motion.div>
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring" as const,
          stiffness: 300,
          damping: 25,
          delay: 0.2,
        }}
        className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
      >
        {jobData.role || "Position"}
      </motion.h2>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring" as const,
          stiffness: 300,
          damping: 25,
          delay: 0.3,
        }}
        className="flex flex-wrap gap-2 mt-4"
      >
        {jobData.employmentType && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
            <Clock className="mr-1 h-3 w-3" />
            {jobData.employmentType}
          </span>
        )}
        {jobData.location && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
            <MapPin className="mr-1 h-3 w-3" />
            {jobData.location}
          </span>
        )}
        {jobData.seniority && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
            <Diamond className="mr-1 h-3 w-3" />
            {jobData.seniority}
          </span>
        )}
        {jobData.industry && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
            <Building className="mr-1 h-3 w-3" />
            {jobData.industry}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
});
