"use client";

import * as React from "react";
import type { PageSettings } from "~/db/schema";
import type { marginSizes, paperSizes } from "./constants";
import { ReviewDialog } from "./review-dialog";
import { ToolbarActions } from "./toolbar-actions";
import { ToolbarBreadcrumbs } from "./toolbar-breadcrumbs";
import { ToolbarDocumentSettings } from "./toolbar-document-settings";
import { ToolbarTypographySettings } from "./toolbar-typography-settings";
import { useToolbarState } from "./use-toolbar-state";

interface PagePreviewToolbarProps {
  paperSize: keyof typeof paperSizes;
  setPaperSize: (size: keyof typeof paperSizes) => void;
  marginSize: keyof typeof marginSizes;
  setMarginSize: (size: keyof typeof marginSizes) => void;
  bodyFont: string;
  setBodyFont: (font: string) => void;
  headingFont: string;
  setHeadingFont: (font: string) => void;
  onShare: (option: "pdf" | "docx" | "link") => void;
  isSharing: boolean;
  children?: React.ReactNode;
  onSettingsChange: (settings: Partial<PageSettings>) => Promise<unknown>;
  pageSettings: PageSettings;
  includeTranscript: boolean;
  setIncludeTranscript: (value: boolean) => void;
  jobId: string;
  onRegenerate?: () => Promise<void>;
}

export const PagePreviewToolbar = React.memo(function PagePreviewToolbar({
  paperSize,
  setPaperSize,
  marginSize,
  setMarginSize,
  bodyFont,
  setBodyFont,
  headingFont,
  setHeadingFont,
  onShare,
  isSharing,
  children,
  onSettingsChange,
  pageSettings,
  includeTranscript,
  setIncludeTranscript,
  jobId,
  onRegenerate,
}: PagePreviewToolbarProps) {
  const {
    isReviewDialogOpen,
    setIsReviewDialogOpen,
    reviewForm,
    setReviewForm,
    handleSettingChange,
    handleReviewSubmit,
    isSubmitting,
  } = useToolbarState({
    onSettingsChange,
    pageSettings,
    setPaperSize,
    setMarginSize,
    setBodyFont,
    setHeadingFont,
  });

  return (
    <div className="flex flex-col w-full">
      <ToolbarBreadcrumbs jobId={jobId} />

      <div className="px-4 py-3 bg-background border-b">
        <div className="flex flex-wrap gap-4 items-center justify-start max-w-5xl mx-auto w-full">
          <ToolbarDocumentSettings
            paperSize={paperSize}
            setPaperSize={setPaperSize}
            marginSize={marginSize}
            setMarginSize={setMarginSize}
            onSettingChange={handleSettingChange}
          />

          <ToolbarTypographySettings
            bodyFont={bodyFont}
            setBodyFont={setBodyFont}
            headingFont={headingFont}
            setHeadingFont={setHeadingFont}
            onSettingChange={handleSettingChange}
          />

          <ToolbarActions
            includeTranscript={includeTranscript}
            setIncludeTranscript={setIncludeTranscript}
            onShare={onShare}
            isSharing={isSharing}
            onReviewClick={() => setIsReviewDialogOpen(true)}
            onRegenerate={onRegenerate}
          />
        </div>
      </div>

      <ReviewDialog
        isOpen={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
        reviewForm={reviewForm}
        onFormChange={(data) => setReviewForm((prev) => ({ ...prev, ...data }))}
        onSubmit={handleReviewSubmit}
        isSubmitting={isSubmitting}
      />

      {children}
    </div>
  );
});
