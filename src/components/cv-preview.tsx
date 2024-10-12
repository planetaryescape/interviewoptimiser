"use client";

import {
  bebasNeue,
  comfortaa,
  crimsonText,
  exo,
  firaCode,
  firaSans,
  geistMono,
  geistSans,
  ibmPlexSans,
  jetbrainsMono,
  lato,
  lora,
  merriweather,
  montserrat,
  nunito,
  openSans,
  oswald,
  playfairDisplay,
  raleway,
  roboto,
  robotoMono,
  rubik,
  sourceSerif,
  ubuntu,
  workSans,
} from "@/app/fonts";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageSettings, SectionsOrder } from "@/db/schema";
import { config } from "@/lib/config";
import { getRepository } from "@/lib/data/repositoryFactory";
import { getPagePreviewHtml } from "@/lib/getPagePreviewHtml";
import { prepareHtml } from "@/lib/prepareHtml";
import { CVWithRelations } from "@/lib/types";
import { mmToPx, remToPx } from "@/lib/unit-conversions";
import { cn } from "@/lib/utils";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMeasure } from "@uidotdev/usehooks";
import "easymde/dist/easymde.min.css";
import { saveAs } from "file-saver";
import { Copy } from "lucide-react"; // Add this import
import { useState } from "react";
import { toast } from "sonner";
import { ClassicLayout } from "./cv-layouts/classic-layout";
import { ModernLayout } from "./cv-layouts/modern-layout";
import { PolishedLayout } from "./cv-layouts/polished-layout";
import { ProfessionalLayout } from "./cv-layouts/professional-layout";
import PagePreview from "./page-preview";
import {
  CVLayout,
  marginSizes,
  PagePreviewToolbar,
  paperSizes,
} from "./page-preview-toolbar";

export function CVPreview({ cv }: { cv: CVWithRelations }) {
  const [paperSize, setPaperSize] = useState<keyof typeof paperSizes>(
    (cv.pageSettings?.paperSize as keyof typeof paperSizes) || "A4"
  );
  const [marginSize, setMarginSize] = useState<keyof typeof marginSizes>(
    (cv.pageSettings?.marginSize as keyof typeof marginSizes) || "Normal"
  );
  const [bodyFont, setBodyFont] = useState(
    cv.pageSettings?.bodyFont || "font-raleway"
  );
  const [headingFont, setHeadingFont] = useState(
    cv.pageSettings?.headingFont || "font-roboto"
  );
  const [layout, setLayout] = useState<CVLayout>(
    (cv.pageSettings?.layout as CVLayout) || "Polished"
  );
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(cv.isPublic);
  const queryClient = useQueryClient();

  const [containerRef, { width: containerWidth }] =
    useMeasure<HTMLDivElement>();

  const pageWidth = paperSizes[paperSize].width;
  const scale = Math.min(
    ((containerWidth ?? 0) - remToPx(4)) / mmToPx(pageWidth),
    1
  );

  const { mutate: exportDocument, isPending } = useMutation({
    mutationFn: async (format: "pdf" | "docx") => {
      const htmlContent = getPagePreviewHtml("cv-preview");

      const processedHtml = prepareHtml(htmlContent, bodyFont, headingFont);

      const response = await fetch(`/api/generate-${format}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          htmlContent: processedHtml,
          paperSize,
          margin: ["Modern"].includes(layout) ? 0 : marginSizes[marginSize],
          bodyFont,
          headingFont,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate ${format.toUpperCase()}`);
      }

      return response.blob();
    },
    onSuccess: (blob, format) => {
      saveAs(blob, `CV - ${cv.name}.${format}`);
      toast.success(`CV exported as ${format.toUpperCase()} successfully`, {
        description:
          format === "docx"
            ? "If you encounter any issues with opening the document in Microsoft Word, please use Google Docs as an alternative, then you can convert it back to docx format."
            : undefined,
        duration: 10000,
      });
    },
    onError: (error, format) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "exportDocument");
        scope.setExtra("format", format);
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });
      toast.error(
        `Something went wrong while exporting ${format.toUpperCase()}. Please try again.`
      );
    },
  });

  const { mutate: toggleCVPublicStatus, isPending: isToggling } = useMutation({
    mutationFn: async (newPublicStatus: boolean) => {
      const cvRepo = await getRepository<CVWithRelations>("cvs");
      return cvRepo.update(idHandler.encode(cv.id), {
        isPublic: newPublicStatus,
      });
    },
    onSuccess: (_, newPublicStatus) => {
      queryClient.invalidateQueries({ queryKey: ["cvs", cv.id.toString()] });
      setIsPublic(newPublicStatus);
      toast.success(newPublicStatus ? "CV made public" : "CV made private", {
        description: newPublicStatus
          ? "Your CV is now publicly viewable."
          : "Your CV is now private.",
      });
    },
    onError: (error) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "toggleCVPublicStatus");
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });
      toast.error("Failed to update CV visibility", {
        description: "Please try again.",
      });
    },
  });

  const { mutate: updatePageSettings } = useMutation({
    mutationFn: async (settings: Partial<PageSettings>) => {
      const pageSettingsRepo = await getRepository<PageSettings>(
        "page-settings"
      );
      return pageSettingsRepo.update(
        idHandler.encode(cv.pageSettingsId ?? 0),
        settings
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cv", idHandler.encode(cv.id)],
      });
      toast.success("Page settings updated successfully");
    },
    onError: (error) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "updatePageSettings");
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });
      toast.error("Failed to update page settings");
    },
  });

  const handleShare = (option: "pdf" | "docx" | "link") => {
    if (option === "link") {
      setIsShareDialogOpen(true);
    } else {
      exportDocument(option);
    }
  };

  const handleTogglePublic = () => {
    toggleCVPublicStatus(!isPublic);
  };

  const handleViewPublic = () => {
    window.open(`/cv/${idHandler.encode(cv.id)}`, "_blank");
  };

  const sectionOrder: { section: keyof SectionsOrder; order: number }[] =
    Object.entries(cv.optimization.sectionsOrder ?? config.defaultSectionsOrder)
      .filter(([section]) =>
        [
          "summary",
          "experiences",
          "educations",
          "links",
          "skills",
          "customSections",
        ].includes(section)
      )
      .map(([section, order]) => ({
        section: section as keyof SectionsOrder,
        order: order as number,
      }))
      .sort((a, b) => a.order - b.order);

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/cv/${idHandler.encode(cv.id)}`;
    navigator.clipboard.writeText(shareLink);
    toast.success("Link copied to clipboard", {
      description: "You can now share this link with others.",
    });
  };

  const handleSettingsChange = async (settings: Partial<PageSettings>) => {
    updatePageSettings(settings);
  };

  return (
    <div
      className={cn(
        "h-full flex flex-col",
        bebasNeue.variable,
        comfortaa.variable,
        crimsonText.variable,
        exo.variable,
        firaCode.variable,
        firaSans.variable,
        geistMono.variable,
        geistSans.variable,
        ibmPlexSans.variable,
        jetbrainsMono.variable,
        lato.variable,
        lora.variable,
        merriweather.variable,
        montserrat.variable,
        nunito.variable,
        openSans.variable,
        oswald.variable,
        playfairDisplay.variable,
        raleway.variable,
        roboto.variable,
        robotoMono.variable,
        rubik.variable,
        sourceSerif.variable,
        ubuntu.variable,
        workSans.variable
      )}
    >
      <PagePreviewToolbar
        paperSize={paperSize}
        setPaperSize={setPaperSize}
        marginSize={marginSize}
        setMarginSize={setMarginSize}
        bodyFont={bodyFont}
        setBodyFont={setBodyFont}
        headingFont={headingFont}
        setHeadingFont={setHeadingFont}
        onShare={handleShare}
        isSharing={isPending || isToggling}
        showLayoutSelector
        layout={layout}
        setLayout={setLayout}
        onSettingsChange={handleSettingsChange}
        pageSettings={cv.pageSettings}
      />
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden p-8 bg-background"
        ref={containerRef}
      >
        <PagePreview
          scale={scale}
          pageWidth={pageWidth}
          pageHeight={paperSizes[paperSize].height}
          margin={["Modern"].includes(layout) ? 0 : marginSizes[marginSize]}
          id="cv-preview"
          className={cn("text-black", bodyFont, headingFont)}
          bodyFont={bodyFont}
          headingFont={headingFont}
          noBorder={["Modern"].includes(layout)}
        >
          {layout === "Polished" ? (
            <PolishedLayout
              cv={cv}
              sectionOrder={sectionOrder}
              bodyFont={bodyFont}
              headingFont={headingFont}
            />
          ) : layout === "Classic" ? (
            <ClassicLayout
              cv={cv}
              bodyFont={bodyFont}
              headingFont={headingFont}
            />
          ) : layout === "Modern" ? (
            <ModernLayout
              cv={cv}
              bodyFont={bodyFont}
              headingFont={headingFont}
            />
          ) : layout === "Professional" ? (
            <ProfessionalLayout
              cv={cv}
              bodyFont={bodyFont}
              headingFont={headingFont}
            />
          ) : null}
        </PagePreview>
      </div>
      <AlertDialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Share CV</AlertDialogTitle>
            <AlertDialogDescription>
              You need to make your CV public before sharing. Once public,
              anyone with the link can view it. You can always make it private
              again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <Switch
              id="public-mode"
              checked={isPublic}
              onCheckedChange={handleTogglePublic}
              disabled={isToggling}
            />
            <Label htmlFor="public-mode">
              Make CV {isPublic ? "private" : "public"}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              value={`${window.location.origin}/cv/${idHandler.encode(cv.id)}`}
              readOnly
              onClick={(e) => e.currentTarget.select()}
              className="flex-grow"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={copyShareLink}
              disabled={!isPublic}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <AlertDialogFooter className="flex justify-between">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <div className="flex space-x-2">
              <Button onClick={handleViewPublic} disabled={!isPublic}>
                View Public
              </Button>
              <Button onClick={() => setIsShareDialogOpen(false)}>Done</Button>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
