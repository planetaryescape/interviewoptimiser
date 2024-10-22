import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageSettings } from "@/db/schema";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Loader2, Maximize, Share, Type } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

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
}: PagePreviewToolbarProps) {
  const queryClient = useQueryClient();

  const { mutate: updatePageSettings } = useMutation({
    mutationFn: onSettingsChange,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-settings"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
      queryClient.invalidateQueries({ queryKey: ["interview"] });
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

  const handleSettingChange = (
    setting: keyof PageSettings,
    value: PageSettings[keyof PageSettings]
  ) => {
    updatePageSettings({ [setting]: value });
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

  return (
    <div className="flex flex-wrap items-end justify-between p-2 bg-card gap-2">
      <div className="flex flex-wrap items-end gap-2">
        <ToolbarItem label="Paper Size">
          <ToolbarSelect
            value={paperSize}
            onValueChange={(value: string) => {
              setPaperSize(value as keyof typeof paperSizes);
              handleSettingChange("paperSize", value);
            }}
            icon={<FileText className="h-4 w-4" />}
            placeholder="Paper size"
            items={Object.keys(paperSizes)}
          />
        </ToolbarItem>
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
        <ToolbarItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isSharing}
                className="h-8"
              >
                {isSharing ? (
                  <Loader2 className="h-4 w-4 animate-spin md:mr-2" />
                ) : (
                  <Share className="h-4 w-4 md:mr-2" />
                )}
                <span className="hidden sm:inline">Share</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onShare("pdf")}>
                Share as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare("link")}>
                Share Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ToolbarItem>
      </div>
      {children}
    </div>
  );
}

interface ToolbarItemProps {
  label?: string;
  children: React.ReactNode;
}

function ToolbarItem({ label, children }: ToolbarItemProps) {
  return (
    <div className="flex flex-col items-start">
      {label && (
        <label className="text-xs text-muted-foreground mb-1">{label}</label>
      )}
      {children}
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

function ToolbarSelect({
  value,
  onValueChange,
  icon,
  placeholder,
  items,
}: ToolbarSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-8 w-[120px] text-xs">
        {icon && <span className="mr-2">{icon}</span>}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem
            key={typeof item === "string" ? item : item.value}
            value={typeof item === "string" ? item : item.value}
          >
            {typeof item === "string" ? item : item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
