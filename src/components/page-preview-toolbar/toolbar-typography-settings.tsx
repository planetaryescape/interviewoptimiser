"use client";

import { Type } from "lucide-react";
import * as React from "react";
import type { PageSettings } from "~/db/schema";
import { fonts } from "./constants";
import { ToolbarItem } from "./toolbar-item";
import { ToolbarSelect } from "./toolbar-select";

interface ToolbarTypographySettingsProps {
  bodyFont: string;
  setBodyFont: (font: string) => void;
  headingFont: string;
  setHeadingFont: (font: string) => void;
  onSettingChange: (setting: keyof PageSettings, value: PageSettings[keyof PageSettings]) => void;
}

export const ToolbarTypographySettings = React.memo(function ToolbarTypographySettings({
  bodyFont,
  setBodyFont,
  headingFont,
  setHeadingFont,
  onSettingChange,
}: ToolbarTypographySettingsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ToolbarItem label="Heading Font">
        <ToolbarSelect
          value={headingFont}
          onValueChange={(value: string) => {
            setHeadingFont(value);
            onSettingChange("headingFont", value);
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
            onSettingChange("bodyFont", value);
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
  );
});
