"use client";

import type { Entity } from "@/lib/utils/formatEntity";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  Briefcase,
  Building,
  CheckCircle2,
  ChevronRight,
  Clock,
  Diamond,
  FileText,
  GraduationCap,
  Layers,
  ListChecks,
  MapPin,
  Star,
  Tag,
  X,
} from "lucide-react";
import { useState } from "react";
import type { JobDescription } from "~/db/schema";
import { Button } from "./ui/button";
import { ParticleSwarmLoader } from "./ui/particle-swarm-loader";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

type JobDetailsSheetProps = {
  jobId: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
};

export function JobDetailsSheet({ jobId, className, variant = "outline" }: JobDetailsSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading, error } = useQuery<Entity<JobDescription>>({
    queryKey: ["jobDescription", jobId],
    queryFn: async () => {
      const res = await fetch(`/api/job-descriptions/${jobId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch job description");
      }
      return res.json();
    },
    enabled: isOpen,
  });

  // Formatting utility function for lists
  const formatList = (list: string[] | null) => {
    if (!list || list.length === 0) return ["Not specified"];
    return list;
  };

  // Framer Motion animations
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

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const listItemVariants = {
    hidden: { x: -10, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
      },
    },
  };

  // Template for displaying a section with an icon
  const SectionWithIcon = ({
    icon: Icon,
    title,
    children,
  }: {
    icon: any;
    title: string;
    children: React.ReactNode;
  }) => (
    <motion.div
      variants={itemVariants}
      className="border-b border-gray-100 dark:border-gray-800 pb-6 mb-6 last:border-0 last:mb-0 last:pb-0"
    >
      <div className="flex items-start">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md text-blue-600 dark:text-blue-400 mr-4">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-200">{title}</h3>
          {children}
        </div>
      </div>
    </motion.div>
  );

  // Template for displaying list items
  const ListSection = ({
    items,
    icon: Icon,
    title,
    emptyMessage = "Not specified",
  }: {
    items: string[] | null;
    icon: any;
    title: string;
    emptyMessage?: string;
  }) => {
    const formattedItems = formatList(items);

    return (
      <SectionWithIcon icon={Icon} title={title}>
        <motion.ul
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          {formattedItems.map((item: string) => (
            <motion.li
              key={`${title}-${item}`}
              variants={listItemVariants}
              className="flex items-start"
            >
              <ChevronRight className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300">{item}</span>
            </motion.li>
          ))}
        </motion.ul>
      </SectionWithIcon>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant={variant} className={className}>
          <FileText className="w-4 h-4 mr-2" />
          View Job Details
        </Button>
      </SheetTrigger>
      <SheetContent
        className="w-full sm:max-w-xl overflow-y-auto bg-white dark:bg-gray-950 p-0"
        side="right"
      >
        <MotionConfig
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          <AnimatePresence>
            <div className="h-full flex flex-col">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 py-4 px-6"
              >
                <div className="flex justify-between items-center">
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white"
                  >
                    Job Description
                  </motion.h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>
              </motion.div>

              {/* Content area */}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <ParticleSwarmLoader />
                  </div>
                ) : error ? (
                  <div className="text-center py-12 px-4">
                    <div className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-500 mb-4">
                      <FileText className="h-24 w-24" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Job description unavailable
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      We couldn&apos;t load the job description. It may not be available for this
                      interview.
                    </p>
                    <Button onClick={() => setIsOpen(false)}>Close</Button>
                  </div>
                ) : data ? (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-2"
                  >
                    {/* Company and Role Header */}
                    <motion.div
                      variants={itemVariants}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-6"
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                          delay: 0.1,
                        }}
                        className="bg-white dark:bg-gray-900 rounded-lg px-4 py-3 mb-4 inline-block"
                      >
                        <motion.span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {data.data.company || "Company"}
                        </motion.span>
                      </motion.div>
                      <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                          delay: 0.2,
                        }}
                        className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
                      >
                        {data.data.role || "Position"}
                      </motion.h2>
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                          delay: 0.3,
                        }}
                        className="flex flex-wrap gap-2 mt-4"
                      >
                        {data.data.employmentType && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                            <Clock className="mr-1 h-3 w-3" />
                            {data.data.employmentType}
                          </span>
                        )}
                        {data.data.location && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                            <MapPin className="mr-1 h-3 w-3" />
                            {data.data.location}
                          </span>
                        )}
                        {data.data.seniority && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                            <Diamond className="mr-1 h-3 w-3" />
                            {data.data.seniority}
                          </span>
                        )}
                        {data.data.industry && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
                            <Building className="mr-1 h-3 w-3" />
                            {data.data.industry}
                          </span>
                        )}
                      </motion.div>
                    </motion.div>

                    {/* Sections */}
                    <ListSection
                      title="Responsibilities"
                      icon={ListChecks}
                      items={data.data.responsibilities}
                    />

                    <ListSection
                      title="Required Skills"
                      icon={CheckCircle2}
                      items={data.data.requiredSkills}
                    />

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

                    <ListSection
                      title="Preferred Skills"
                      icon={Star}
                      items={data.data.preferredSkills}
                    />

                    <ListSection
                      title="Preferred Qualifications"
                      icon={GraduationCap}
                      items={data.data.preferredQualifications}
                    />

                    <ListSection title="Benefits" icon={Diamond} items={data.data.benefits} />

                    <ListSection
                      title="Key Technologies"
                      icon={Layers}
                      items={data.data.keyTechnologies}
                    />

                    {/* Keywords */}
                    {data.data.keywords && data.data.keywords.length > 0 && (
                      <motion.div variants={itemVariants} className="pt-4">
                        <h3 className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-200">
                          Keywords
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {data.data.keywords.map((keyword: string, index: number) => (
                            <motion.span
                              key={`keyword-${keyword}`}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{
                                delay: 0.1 * index,
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                              }}
                              className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                            >
                              <Tag className="mr-1 h-3 w-3" />
                              {keyword}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ) : null}
              </div>
            </div>
          </AnimatePresence>
        </MotionConfig>
      </SheetContent>
    </Sheet>
  );
}
