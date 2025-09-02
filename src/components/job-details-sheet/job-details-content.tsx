"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  CheckCircle2,
  Diamond,
  FileText,
  GraduationCap,
  Layers,
  ListChecks,
  Star,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import type { Entity } from "@/lib/utils/formatEntity";
import type { JobDescription } from "~/db/schema";
import { CompanyRoleHeader } from "./company-role-header";
import { KeywordsSection } from "./keywords-section";
import { ListSection } from "./list-section";

interface JobDetailsContentProps {
  data: Entity<JobDescription> | undefined;
  isLoading: boolean;
  error: Error | null;
  onClose: () => void;
}

function areEqual(prevProps: JobDetailsContentProps, nextProps: JobDetailsContentProps): boolean {
  // Check if loading state changed
  if (prevProps.isLoading !== nextProps.isLoading) return false;

  // Check if error state changed
  if (prevProps.error !== nextProps.error) return false;

  // Check if onClose function reference changed
  if (prevProps.onClose !== nextProps.onClose) return false;

  // Deep compare data objects
  if (!prevProps.data && !nextProps.data) return true;
  if (!prevProps.data || !nextProps.data) return false;

  // Compare the entity structure
  if (prevProps.data.sys.id !== nextProps.data.sys.id) return false;
  if (prevProps.data.sys.updatedAt !== nextProps.data.sys.updatedAt) return false;

  return true;
}

export const JobDetailsContent = React.memo(function JobDetailsContent({
  data,
  isLoading,
  error,
  onClose,
}: JobDetailsContentProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <ParticleSwarmLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <div className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-500 mb-4">
          <FileText className="h-24 w-24" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Job description unavailable
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          We couldn&apos;t load the job description. It may not be available for this interview.
        </p>
        <Button onClick={onClose}>Close</Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-2"
    >
      <CompanyRoleHeader jobData={data.data} />

      <ListSection title="Responsibilities" icon={ListChecks} items={data.data.responsibilities} />

      <ListSection title="Required Skills" icon={CheckCircle2} items={data.data.requiredSkills} />

      <ListSection
        title="Required Qualifications"
        icon={GraduationCap}
        items={data.data.requiredQualifications}
      />

      <ListSection
        title="Required Experience"
        icon={Briefcase}
        items={data.data.requiredExperience}
      />

      <ListSection title="Preferred Skills" icon={Star} items={data.data.preferredSkills} />

      <ListSection
        title="Preferred Qualifications"
        icon={GraduationCap}
        items={data.data.preferredQualifications}
      />

      <ListSection title="Benefits" icon={Diamond} items={data.data.benefits} />

      <ListSection title="Key Technologies" icon={Layers} items={data.data.keyTechnologies} />

      <KeywordsSection keywords={data.data.keywords} />
    </motion.div>
  );
}, areEqual);
