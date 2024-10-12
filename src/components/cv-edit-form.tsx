"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useSimpleMDEOptions } from "@/config/simplemde-options";
import { CV, SectionsOrder } from "@/db/schema";
import { useUser } from "@/hooks/useUser";
import { config } from "@/lib/config";
import { getRepository } from "@/lib/data/repositoryFactory";
import { CVWithRelations } from "@/lib/types";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { capital } from "case";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import { CustomSectionComponent } from "./custom-section";
import { CVAnalysisScore } from "./cv-analysis-score";
import { EducationSection } from "./education-section";
import { ExperienceSection } from "./experience-section";
import { FeedbackSection } from "./feedback-section";
import { LinksSection } from "./links-section";
import { PersonalDetailsSection } from "./personal-details-section";
import { SkillsSection } from "./skills-section";

import { idHandler } from "@/lib/utils/idHandler";
import "easymde/dist/easymde.min.css";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { usePostHog } from "posthog-js/react";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

export function CVEditForm({
  cv,
  setCV,
  feedbackItems,
  setFeedbackItems,
  setShowTakeover,
  showGenerateCoverLetterButton,
}: {
  cv: CVWithRelations;
  setCV: Dispatch<SetStateAction<CVWithRelations | null>>;
  feedbackItems: { id: number; content: string; completed: boolean }[];
  setFeedbackItems: Dispatch<
    SetStateAction<{ id: number; content: string; completed: boolean }[]>
  >;
  setShowTakeover: Dispatch<SetStateAction<boolean>>;
  showGenerateCoverLetterButton: boolean;
}) {
  const router = useRouter();
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [alertDialogContent, setAlertDialogContent] = useState<{
    title: string;
    description: string;
    action: () => void;
  }>({
    title: "",
    description: "",
    action: () => {},
  });

  const { data: user } = useUser();

  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(config.cvSections)
  );

  const handleChange = (field: string, value: string) => {
    setCV((prevCV) => {
      if (!prevCV) return null;
      return { ...prevCV, [field]: value };
    });
  };

  const moveSectionUp = (section: keyof SectionsOrder) => {
    setCV((prevCV) => {
      if (!prevCV) return null;
      const newSectionsOrder = {
        ...prevCV.optimization.sectionsOrder,
      } as unknown as { [key: string]: number };
      const currentOrder = newSectionsOrder[section] as number;

      // Find the section immediately above
      const sectionAbove = Object.entries(newSectionsOrder).find(
        ([_, order]) => order === currentOrder - 1
      );

      if (sectionAbove) {
        // Swap the order of the current section and the one above it
        newSectionsOrder[section] = currentOrder - 1;
        newSectionsOrder[sectionAbove[0] as keyof SectionsOrder] = currentOrder;

        return {
          ...prevCV,
          optimization: {
            ...prevCV.optimization,
            sectionsOrder: {
              ...prevCV.optimization.sectionsOrder,
              ...newSectionsOrder,
            },
          },
        };
      }
      return prevCV;
    });
  };

  const moveSectionDown = (section: keyof SectionsOrder) => {
    setCV((prevCV) => {
      if (!prevCV) return null;
      const newSectionsOrder = {
        ...prevCV.optimization.sectionsOrder,
      } as unknown as { [key: string]: number };
      const currentOrder = newSectionsOrder[section] as number;

      // Find the section immediately below
      const sectionBelow = Object.entries(newSectionsOrder).find(
        ([_, order]) => order === currentOrder + 1
      );

      if (sectionBelow) {
        // Swap the order of the current section and the one below it
        newSectionsOrder[section] = currentOrder + 1;
        newSectionsOrder[sectionBelow[0] as keyof SectionsOrder] = currentOrder;

        return {
          ...prevCV,
          optimization: {
            ...prevCV.optimization,
            sectionsOrder: {
              ...prevCV.optimization.sectionsOrder,
              ...newSectionsOrder,
            },
          },
        };
      }
      return prevCV;
    });
  };

  const simpleMDEOptions = useSimpleMDEOptions();

  const { mutate: generateCoverLetter, isPending } = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          optimizationId: idHandler.encode(cv.optimizationId),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate cover letter");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Cover letter generation started");
      setShowTakeover(true);
      setTimeout(() => {
        router.push("/dashboard");
        setShowTakeover(false);
      }, 9000);
    },
    onError: (error) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "generateCoverLetter");
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });
      toast.error("Failed to generate cover letter");
    },
  });

  const { mutate: saveCV, isPending: isSaving } = useMutation({
    mutationFn: async (updatedCV: CV) => {
      const cvRepo = await getRepository<CV>("cvs");
      await cvRepo.update(idHandler.encode(updatedCV.id), updatedCV);
    },
    onSuccess: () => {
      toast.success("CV saved successfully");
    },
    onError: (error) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "saveCV");
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });
      toast.error("Failed to save CV");
    },
  });

  const posthog = usePostHog();

  const handleGenerateCoverLetter = () => {
    if (user && user.credits > 0) {
      posthog.capture("generate_cover_letter", {
        userId: user?.id,
      });
      setAlertDialogContent({
        title: "Generate Cover Letter",
        description:
          "Generating a cover letter will cost 1 credit. Are you sure you want to proceed?",
        action: () => {
          setIsAlertDialogOpen(false);
          generateCoverLetter();
        },
      });
    } else {
      posthog.capture("out_of_credits", {
        userId: user?.id,
      });
      setAlertDialogContent({
        title: "Out of Credits",
        description:
          "You've run out of credits. Purchase more credits to continue generating cover letters.",
        action: () => {
          setIsAlertDialogOpen(false);
          router.push("/pricing");
          console.log("Navigating to credits purchase page...");
        },
      });
    }
    setIsAlertDialogOpen(true);
  };

  const queryClient = useQueryClient();

  const { mutate: deleteCV, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const cvRepo = await getRepository<CV>("cvs");
      await cvRepo.delete(idHandler.encode(cv.id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["optimizations"] });
      toast.success("CV deleted successfully");
      router.push("/dashboard");
    },
    onError: (error) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "deleteCV");
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });
      toast.error("Failed to delete CV");
    },
  });

  const handleDeleteCV = () => {
    setAlertDialogContent({
      title: "Delete CV",
      description:
        "Are you sure you want to delete this CV? This action cannot be undone.",
      action: () => {
        setIsAlertDialogOpen(false);
        deleteCV();
      },
    });
    setIsAlertDialogOpen(true);
  };

  const sectionOrder: { section: keyof SectionsOrder; order: number }[] =
    Object.entries(cv.optimization.sectionsOrder ?? config.defaultSectionsOrder)
      .filter((value) => config.cvSections.includes(value[0]))
      .map(([section, order]) => ({
        section: section as keyof SectionsOrder,
        order: order as number,
      }))
      .sort((a, b) => a.order - b.order);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const isSectionOpen = (section: string) => openSections.has(section);

  return (
    <div className="grid grid-rows-[1fr_auto] h-full bg-background">
      <div className="overflow-y-auto p-4 space-y-4 row-span-1">
        <CVAnalysisScore score={cv.optimization.score ?? 0} />

        <FeedbackSection
          feedbackItems={feedbackItems}
          setFeedbackItems={setFeedbackItems}
        />

        <PersonalDetailsSection cv={cv} setCV={setCV} />

        <AnimatePresence initial={false}>
          {sectionOrder.map(({ section, order }) => (
            <motion.div
              key={section}
              layout
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="mb-4 rounded-md bg-card border border-gray-300 dark:border-gray-600"
            >
              <div className="flex items-center justify-between p-4">
                <h3 className="text-lg text-foreground font-semibold">
                  {capital(section)}
                </h3>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      moveSectionUp(section as keyof SectionsOrder)
                    }
                    disabled={order === 0}
                  >
                    Move Up
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      moveSectionDown(section as keyof SectionsOrder)
                    }
                    disabled={order === sectionOrder.length - 1}
                  >
                    Move Down
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleSection(section)}
                    aria-label={`Toggle ${section} section`}
                  >
                    {isSectionOpen(section) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <AnimatePresence initial={false}>
                {isSectionOpen(section) && (
                  <motion.div
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { opacity: 1, height: "auto" },
                      collapsed: { opacity: 0, height: 0 },
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="p-4 space-y-4">
                      {section === "summary" && (
                        <SimpleMDE
                          value={cv.summary}
                          onChange={(value) => handleChange("summary", value)}
                          options={simpleMDEOptions}
                        />
                      )}
                      {section === "experiences" && (
                        <ExperienceSection cv={cv} setCV={setCV} />
                      )}
                      {section === "educations" && (
                        <EducationSection cv={cv} setCV={setCV} />
                      )}
                      {section === "skills" && (
                        <SkillsSection cv={cv} setCV={setCV} />
                      )}
                      {section === "links" && (
                        <LinksSection cv={cv} setCV={setCV} />
                      )}
                      {section === "customSections" && (
                        <CustomSectionComponent
                          cv={cv}
                          setCV={setCV}
                          section={section}
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="p-4 bg-muted-background text-muted-foreground sticky bottom-0 z-10 row-span-1 flex justify-between">
        <Button
          onClick={handleDeleteCV}
          disabled={isDeleting}
          variant="destructive"
          className=""
        >
          {isDeleting ? "Deleting..." : <Trash2 className="w-4 h-4" />}
        </Button>
        {showGenerateCoverLetterButton && (
          <Button
            onClick={handleGenerateCoverLetter}
            disabled={isPending}
            className=""
          >
            {isPending ? "Generating..." : "Generate Cover Letter"}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => saveCV(cv)}
          disabled={isSaving}
          className=""
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertDialogContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={alertDialogContent.action}>
              {alertDialogContent.title === "Delete CV"
                ? "Delete"
                : user && user.credits > 0
                ? "Proceed"
                : "Buy Credits"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
