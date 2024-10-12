"use client";

import { CVEditForm } from "@/components/cv-edit-form";
import { CVPreview } from "@/components/cv-preview";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Toggle } from "@/components/ui/toggle";
import { getRepository } from "@/lib/data/repositoryFactory";
import { CVWithRelations } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function EditCV({ params }: { params: { id: string } }) {
  const { data, isLoading } = useQuery({
    queryKey: ["cv", params.id],
    queryFn: async () => {
      const cvRepo = await getRepository<CVWithRelations>("cvs");
      const cv = await cvRepo.getById(params.id);
      return cv;
    },
  });

  const [cv, setCV] = useState<CVWithRelations | null>(null);

  const [feedbackItems, setFeedbackItems] = useState<
    { id: number; content: string; completed: boolean }[]
  >([]);

  const [showTakeover, setShowTakeover] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (data) {
      setCV(data.data);
    }
    if (data?.data?.optimization?.feedback) {
      setFeedbackItems(
        data?.data?.optimization?.feedback.map((item) => ({
          id: item.id,
          content: item.content,
          completed: false,
        }))
      );
    }
  }, [data]);

  if (isLoading)
    return (
      <div className="size-full flex items-center justify-center">
        <ParticleSwarmLoader />
      </div>
    );
  if (!cv) return <div>CV not found</div>;

  const optimization = cv.optimization;

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden">
      <div className="sticky top-0 z-10 block md:hidden bg-background p-2 row-span-1">
        <Toggle
          pressed={showPreview}
          onPressedChange={setShowPreview}
          aria-label="Toggle Preview"
          className="w-full"
        >
          {showPreview ? "Show Editor" : "Show Preview"}
        </Toggle>
      </div>
      <ResizablePanelGroup
        direction="horizontal"
        className="bg-muted text-muted-foreground row-span-1 overflow-y-auto"
      >
        <ResizablePanel
          minSize={30}
          className={showPreview ? "hidden md:block" : "block"}
        >
          <CVEditForm
            cv={cv}
            setCV={setCV}
            feedbackItems={feedbackItems}
            setFeedbackItems={setFeedbackItems}
            setShowTakeover={setShowTakeover}
            showGenerateCoverLetterButton={Boolean(!optimization?.coverLetter)}
          />
        </ResizablePanel>
        <ResizableHandle withHandle className="hidden md:flex" />
        <ResizablePanel
          minSize={30}
          className={showPreview ? "block" : "hidden md:block"}
        >
          <CVPreview cv={cv} />
        </ResizablePanel>
      </ResizablePanelGroup>

      <AnimatePresence>
        {showTakeover && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card text-card-foreground p-6 rounded-lg shadow-lg text-center"
            >
              <h2 className="text-2xl font-bold mb-4">
                Generating Cover Letter
              </h2>
              <div className="mb-6 flex justify-center items-center">
                <ParticleSwarmLoader />
              </div>
              <p className="mb-4">
                We&apos;re generating your cover letter. This process usually
                takes about a minute. You&apos;ll be redirected to the dashboard
                in a moment.
              </p>
              <p className="text-sm text-muted-foreground">
                Your cover letter will continue processing in the background.
              </p>
              <p className="text-sm text-muted-foreground">
                You&apos;ll see a &quot;View Cover Letter&quot; button on your
                optimization in the dashboard when it&apos;s ready.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
