"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ToolbarSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  icon?: React.ReactNode;
  placeholder: string;
  items: Array<{ value: string; label: string } | string>;
}

export const ToolbarSelect = React.memo(function ToolbarSelect({
  value,
  onValueChange,
  icon,
  placeholder,
  items,
}: ToolbarSelectProps) {
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
});
