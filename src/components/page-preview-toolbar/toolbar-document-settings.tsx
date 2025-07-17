"use client";

import { FileText, Maximize } from "lucide-react";
import * as React from "react";
import type { PageSettings } from "~/db/schema";
import { marginSizes, paperSizes } from "./constants";
import { ToolbarItem } from "./toolbar-item";
import { ToolbarSelect } from "./toolbar-select";

interface ToolbarDocumentSettingsProps {
  paperSize: keyof typeof paperSizes;
  setPaperSize: (size: keyof typeof paperSizes) => void;
  marginSize: keyof typeof marginSizes;
  setMarginSize: (size: keyof typeof marginSizes) => void;
  onSettingChange: (setting: keyof PageSettings, value: PageSettings[keyof PageSettings]) => void;
}

export const ToolbarDocumentSettings = React.memo(function ToolbarDocumentSettings({
  paperSize,
  setPaperSize,
  marginSize,
  setMarginSize,
  onSettingChange,
}: ToolbarDocumentSettingsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ToolbarItem label="Paper Size">
        <ToolbarSelect
          value={paperSize}
          onValueChange={(value: string) => {
            setPaperSize(value as keyof typeof paperSizes);
            onSettingChange("paperSize", value);
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
            onSettingChange("marginSize", value);
          }}
          icon={<Maximize className="h-4 w-4" />}
          placeholder="Margin"
          items={Object.keys(marginSizes)}
        />
      </ToolbarItem>
    </div>
  );
});
