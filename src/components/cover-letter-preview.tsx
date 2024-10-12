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
import { CoverLetter, CV, PageSettings } from "@/db/schema";
import { getRepository } from "@/lib/data/repositoryFactory";
import { getPagePreviewHtml } from "@/lib/getPagePreviewHtml";
import { prepareHtml } from "@/lib/prepareHtml";
import { mmToPx, remToPx } from "@/lib/unit-conversions";
import { cn } from "@/lib/utils";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMeasure } from "@uidotdev/usehooks";
import "easymde/dist/easymde.min.css";
import { saveAs } from "file-saver";
import { Copy } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import PagePreview from "./page-preview";
import {
  marginSizes,
  PagePreviewToolbar,
  paperSizes,
} from "./page-preview-toolbar";
import { remarkMarkdownComponents } from "./remark-markdown-components";

export function CoverLetterPreview({
  coverLetter,
}: {
  coverLetter: CoverLetter & {
    pageSettings: PageSettings;
    optimization: {
      cv: CV;
      company?: string;
      role?: string;
    };
  };
}) {
  const [paperSize, setPaperSize] = useState<keyof typeof paperSizes>(
    coverLetter.pageSettings.paperSize as keyof typeof paperSizes
  );
  const [marginSize, setMarginSize] = useState<keyof typeof marginSizes>(
    coverLetter.pageSettings.marginSize as keyof typeof marginSizes
  );
  const [bodyFont, setBodyFont] = useState(coverLetter.pageSettings.bodyFont);
  const [headingFont, setHeadingFont] = useState(
    coverLetter.pageSettings.headingFont
  );
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(coverLetter.isPublic);
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
      const htmlContent = getPagePreviewHtml("cover-letter-preview");

      const processedHtml = prepareHtml(htmlContent, bodyFont, headingFont);

      const response = await fetch(`/api/generate-${format}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          htmlContent: processedHtml,
          paperSize,
          margin: marginSizes[marginSize as keyof typeof marginSizes],
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
      saveAs(
        blob,
        `Cover Letter - ${coverLetter.optimization.cv.name} - ${coverLetter.optimization.company} - ${coverLetter.optimization.role}.${format}`
      );
      toast.success(
        `Cover letter exported as ${format.toUpperCase()} successfully`,
        {
          description:
            format === "docx"
              ? "If you encounter any issues with opening the document in Microsoft Word, please use Google Docs as an alternative, then you can convert it back to docx format."
              : "",
          position: "top-center",
          richColors: true,
          duration: 10000,
        }
      );
    },
    onError: (error, format) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "exportDocument");
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });
      toast.error(`Failed to export ${format.toUpperCase()}`);
    },
  });

  const { mutate: toggleCoverLetterPublicStatus, isPending: isToggling } =
    useMutation({
      mutationFn: async (newPublicStatus: boolean) => {
        const coverLetterRepo = await getRepository<CoverLetter>(
          "cover-letters"
        );
        return coverLetterRepo.update(idHandler.encode(coverLetter.id), {
          isPublic: newPublicStatus,
        });
      },
      onSuccess: (_, newPublicStatus) => {
        queryClient.invalidateQueries({
          queryKey: ["cover-letters", coverLetter.id.toString()],
        });
        setIsPublic(newPublicStatus);
        toast.success(
          newPublicStatus
            ? "Cover letter made public"
            : "Cover letter made private",
          {
            description: newPublicStatus
              ? "Your cover letter is now publicly viewable."
              : "Your cover letter is now private.",
          }
        );
      },
      onError: (error) => {
        Sentry.withScope((scope) => {
          scope.setExtra("context", "toggleCoverLetterPublicStatus");
          scope.setExtra("error", error);
          scope.setExtra("message", error.message);

          Sentry.captureException(error);
        });
        toast.error("Failed to update cover letter visibility", {
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
        idHandler.encode(coverLetter.pageSettingsId ?? 0),
        settings
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cover-letter", idHandler.encode(coverLetter.id)],
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

  const handleSettingsChange = async (settings: Partial<PageSettings>) => {
    updatePageSettings(settings);
  };

  const handleShare = (option: "pdf" | "docx" | "link") => {
    if (option === "link") {
      setIsShareDialogOpen(true);
    } else {
      exportDocument(option);
    }
  };

  const handleTogglePublic = () => {
    toggleCoverLetterPublicStatus(!isPublic);
  };

  const copyShareLink = () => {
    const shareLink = `${
      window.location.origin
    }/cover-letter/${idHandler.encode(coverLetter.id)}`;
    navigator.clipboard.writeText(shareLink);
    toast.success("Link copied to clipboard", {
      description: "You can now share this link with others.",
    });
  };

  const handleViewPublic = () => {
    window.open(`/cover-letter/${idHandler.encode(coverLetter.id)}`, "_blank");
  };

  // Function to add extra newlines between paragraphs
  const formatContent = (content: string) => {
    return content.replace(/\n(?=\n)/g, "\n\n");
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
        onSettingsChange={handleSettingsChange}
        pageSettings={coverLetter.pageSettings}
      />
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden p-8 bg-background"
        ref={containerRef}
      >
        <PagePreview
          scale={scale}
          pageWidth={paperSizes[paperSize].width}
          pageHeight={paperSizes[paperSize].height}
          margin={marginSizes[marginSize]}
          id="cover-letter-preview"
          className="text-black"
          bodyFont={bodyFont}
          headingFont={headingFont}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={remarkMarkdownComponents}
          >
            {formatContent(coverLetter.content)}
          </ReactMarkdown>
        </PagePreview>
      </div>
      <AlertDialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Share Cover Letter</AlertDialogTitle>
            <AlertDialogDescription>
              You need to make your cover letter public before sharing. Once
              public, anyone with the link can view it. You can always make it
              private again later.
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
              Make cover letter {isPublic ? "private" : "public"}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              value={`${window.location.origin}/cover-letter/${idHandler.encode(
                coverLetter.id
              )}`}
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
