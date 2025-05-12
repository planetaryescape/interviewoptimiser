import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  FileText,
  Home,
  Loader2,
  Maximize,
  RefreshCw,
  Share,
  StarIcon,
  Type,
} from "lucide-react";
import Link from "next/link";
import { useFeatureFlagEnabled } from "posthog-js/react";
import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { PageSettings } from "~/db/schema";
import { ReviewForm, type ReviewFormData } from "./review-form";

export const paperSizes = {
  A4: { width: 210, height: 297 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
};

export const marginSizes = {
  Normal: 20,
  Narrow: 12.7,
  Wide: 25.4,
};

const fonts = [
  { label: "Bebas Neue", value: "font-bebas-neue" },
  { label: "Butler", value: "font-butler" },
  { label: "Comfortaa", value: "font-comfortaa" },
  { label: "Crimson Text", value: "font-crimson-text" },
  { label: "Exo", value: "font-exo" },
  { label: "Fira Code", value: "font-firaCode" },
  { label: "Fira Sans", value: "font-fira-sans" },
  { label: "Geist Sans", value: "font-geist-sans" },
  { label: "Geist Mono", value: "font-geist-mono" },
  { label: "IBM Plex Sans", value: "font-ibm-plex-sans" },
  { label: "JetBrains Mono", value: "font-jetbrainsMono" },
  { label: "Lato", value: "font-lato" },
  { label: "Lora", value: "font-lora" },
  { label: "Merriweather", value: "font-merriweather" },
  { label: "Montserrat", value: "font-montserrat" },
  { label: "Nunito", value: "font-nunito" },
  { label: "Open Sans", value: "font-openSans" },
  { label: "Oswald", value: "font-oswald" },
  { label: "Playfair Display", value: "font-playfairDisplay" },
  { label: "Raleway", value: "font-raleway" },
  { label: "Roboto", value: "font-roboto" },
  { label: "Roboto Mono", value: "font-roboto-mono" },
  { label: "Rubik", value: "font-rubik" },
  { label: "Source Serif", value: "font-sourceSerif" },
  { label: "Ubuntu", value: "font-ubuntu" },
  { label: "Work Sans", value: "font-work-sans" },
];

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

export function PagePreviewToolbar({
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
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    name: "",
    comment: "",
    twitterUsername: "",
    linkedinUrl: "",
    showOnLanding: false,
    rating: 5,
  });

  const regenerateButtonEnabled = useFeatureFlagEnabled("regenerate_button");

  const { mutate: updatePageSettings } = useMutation({
    mutationFn: onSettingsChange,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-settings"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
      queryClient.invalidateQueries({ queryKey: ["job"] });
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

  const { mutate: submitReview, isPending: isSubmitting } = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to submit review");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Thank you for your review!");
      setIsReviewDialogOpen(false);
      setReviewForm({
        name: "",
        comment: "",
        twitterUsername: "",
        linkedinUrl: "",
        showOnLanding: false,
        rating: 5,
      });
    },
    onError: (error) => {
      toast.error("Failed to submit review. Please try again later.");
      console.error("Error submitting review:", error);
    },
  });

  const handleSettingChange = (
    setting: keyof PageSettings,
    value: PageSettings[keyof PageSettings]
  ) => {
    updatePageSettings({ [setting]: value });
  };

  const handleReviewSubmit = () => {
    submitReview(reviewForm);
  };

  // Use useEffect to set initial values from pageSettings
  useEffect(() => {
    if (pageSettings?.paperSize) {
      setPaperSize(pageSettings.paperSize as keyof typeof paperSizes);
    }
    if (pageSettings?.marginSize) {
      setMarginSize(pageSettings.marginSize as keyof typeof marginSizes);
    }
    if (pageSettings?.bodyFont) {
      setBodyFont(pageSettings.bodyFont);
    }
    if (pageSettings?.headingFont) {
      setHeadingFont(pageSettings.headingFont);
    }
  }, [pageSettings, setPaperSize, setMarginSize, setBodyFont, setHeadingFont]);

  // Add effect to prefill name when user data is available
  useEffect(() => {
    if ((user?.firstName || user?.lastName) && isReviewDialogOpen) {
      setReviewForm((prev) => ({
        ...prev,
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || prev.name,
      }));
    }
  }, [user, isReviewDialogOpen]);

  return (
    <div className="flex flex-col w-full">
      {/* Breadcrumbs */}
      <div className="px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center text-sm text-muted-foreground max-w-5xl mx-auto w-full">
          <Link
            href="/dashboard"
            className="flex items-center hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link
            href={`/dashboard/jobs/${jobId}/reports`}
            className="hover:text-foreground transition-colors"
          >
            Reports
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground">Report Preview</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-3 bg-gradient-to-b from-background/80 to-background border-b backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-wrap gap-4 items-center justify-between max-w-5xl mx-auto w-full">
          {/* Document Settings Group */}
          <div className="flex flex-wrap items-center gap-3">
            <ToolbarItem label="Paper Size">
              <ToolbarSelect
                value={paperSize}
                onValueChange={(value: string) => {
                  setPaperSize(value as keyof typeof paperSizes);
                  handleSettingChange("paperSize", value);
                }}
                icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                placeholder="Paper size"
                items={Object.keys(paperSizes)}
              />
            </ToolbarItem>
            <ToolbarItem label="Margin Size">
              <ToolbarSelect
                value={marginSize}
                onValueChange={(value: string) => {
                  setMarginSize(value as keyof typeof marginSizes);
                  handleSettingChange("marginSize", value);
                }}
                icon={<Maximize className="h-4 w-4" />}
                placeholder="Margin"
                items={Object.keys(marginSizes)}
              />
            </ToolbarItem>
          </div>

          {/* Typography Settings Group */}
          <div className="flex flex-wrap items-center gap-3">
            <ToolbarItem label="Heading Font">
              <ToolbarSelect
                value={headingFont}
                onValueChange={(value: string) => {
                  setHeadingFont(value);
                  handleSettingChange("headingFont", value);
                }}
                icon={<Type className="h-4 w-4" />}
                placeholder="Heading Font"
                items={fonts.map((font) => ({
                  value: font.value,
                  label: font.label,
                }))}
              />
            </ToolbarItem>
            <ToolbarItem label="Body Font">
              <ToolbarSelect
                value={bodyFont}
                onValueChange={(value: string) => {
                  setBodyFont(value);
                  handleSettingChange("bodyFont", value);
                }}
                icon={<Type className="h-4 w-4" />}
                placeholder="Body Font"
                items={fonts.map((font) => ({
                  value: font.value,
                  label: font.label,
                }))}
              />
            </ToolbarItem>
          </div>

          {/* Actions Group */}
          <div className="flex items-center gap-3">
            <ToolbarItem label="Include Transcript">
              <div className="flex items-center space-x-2 h-9">
                <Switch
                  id="transcript-toggle"
                  checked={includeTranscript}
                  onCheckedChange={setIncludeTranscript}
                  className="data-[state=checked]:bg-primary"
                />
                <Label htmlFor="transcript-toggle" className="text-xs font-medium">
                  {includeTranscript ? "On" : "Off"}
                </Label>
              </div>
            </ToolbarItem>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isSharing}
                    className="h-9 px-4 shadow-sm transition-colors hover:bg-secondary/80"
                  >
                    {isSharing ? (
                      <Loader2 className="h-4 w-4 animate-spin md:mr-2" />
                    ) : (
                      <Share className="h-4 w-4 md:mr-2" />
                    )}
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[160px]">
                  <DropdownMenuItem onClick={() => onShare("pdf")}>Share as PDF</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onShare("link")}>Share Link</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsReviewDialogOpen(true)}
                className="h-9 px-4 shadow-sm transition-colors hover:bg-secondary/80"
              >
                <StarIcon className="h-4 w-4 md:mr-2 text-yellow-500" />
                <span className="hidden sm:inline">Review</span>
              </Button>

              {regenerateButtonEnabled && onRegenerate && (
                <Button variant="secondary" size="sm" onClick={onRegenerate} className="h-8">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Keep existing Dialog component */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-full h-full sm:h-[90vh] sm:max-w-[90vw] sm:max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Leave a Review</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-6 py-4 px-2">
              <div className="max-w-2xl mx-auto">
                <ReviewForm
                  formData={reviewForm}
                  onFormChange={(data) => setReviewForm((prev) => ({ ...prev, ...data }))}
                  onSubmit={handleReviewSubmit}
                  isSubmitting={isSubmitting}
                  autoFocus
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {children}
    </div>
  );
}

interface ToolbarItemProps {
  label?: string;
  children: React.ReactNode;
}

function ToolbarItem({ label, children }: ToolbarItemProps) {
  const labelId = React.useId();

  return (
    <div className="flex flex-col items-start space-y-1.5">
      {label && (
        <span id={labelId} className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      )}
      <div aria-labelledby={label ? labelId : undefined}>{children}</div>
    </div>
  );
}

interface ToolbarSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  icon?: React.ReactNode;
  placeholder: string;
  items: Array<{ value: string; label: string } | string>;
}

function ToolbarSelect({ value, onValueChange, icon, placeholder, items }: ToolbarSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-9 w-[140px] text-sm bg-background border shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
        {icon && <span className="mr-2">{icon}</span>}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {items.map((item) => (
          <SelectItem
            key={typeof item === "string" ? item : item.value}
            value={typeof item === "string" ? item : item.value}
            className="text-sm"
          >
            {typeof item === "string" ? item : item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
