"use client";

import { Button } from "@/components/ui/button";
import { useSimpleMDEOptions } from "@/config/simplemde-options";
import { CoverLetter, CV, PageSettings } from "@/db/schema";
import { getRepository } from "@/lib/data/repositoryFactory";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { useMutation } from "@tanstack/react-query";
import "easymde/dist/easymde.min.css";
import dynamic from "next/dynamic";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

export function CoverLetterEditForm({
  coverLetter,
  setCoverLetter,
}: {
  coverLetter: CoverLetter & {
    pageSettings: PageSettings;
    optimization: {
      cv: CV;
    };
  };
  setCoverLetter: Dispatch<
    SetStateAction<
      | (CoverLetter & {
          pageSettings: PageSettings;
          optimization: {
            cv: CV;
          };
        })
      | null
    >
  >;
}) {
  const handleChange = (field: string, value: string) => {
    setCoverLetter((prevCoverLetter) => {
      if (!prevCoverLetter) return null;
      return { ...prevCoverLetter, [field]: value };
    });
  };

  const simpleMDEOptions = useSimpleMDEOptions();

  const { mutate: saveCoverLetter, isPending: isSaving } = useMutation({
    mutationFn: async (updatedCoverLetter: CoverLetter) => {
      const coverLetterRepo = await getRepository<CoverLetter>("cover-letters");
      await coverLetterRepo.update(
        idHandler.encode(updatedCoverLetter.id),
        updatedCoverLetter
      );
    },
    onSuccess: () => {
      toast.success("Cover letter saved successfully");
    },
    onError: (error) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "saveCoverLetter");
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });
      toast.error("Failed to save cover letter");
    },
  });

  return (
    <div className="grid grid-rows-[1fr_auto] h-full">
      <div className="m-4 overflow-y-auto space-y-4 p-4 rounded-md bg-card border border-gray-300 dark:border-gray-600">
        <SimpleMDE
          className="h-[100px]"
          value={coverLetter.content}
          onChange={(value) => handleChange("content", value)}
          options={simpleMDEOptions}
        />
      </div>
      <div className="p-4 bg-muted-background text-muted-foreground sticky bottom-0 z-10 flex justify-center">
        <Button
          disabled={isSaving}
          onClick={() => saveCoverLetter(coverLetter)}
          className="w-1/2"
        >
          {isSaving ? "Saving..." : "Save Cover Letter"}
        </Button>
      </div>
    </div>
  );
}
