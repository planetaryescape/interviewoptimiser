"use client";

import * as React from "react";

interface ToolbarItemProps {
  label?: string;
  children: React.ReactNode;
}

export const ToolbarItem = React.memo(function ToolbarItem({ label, children }: ToolbarItemProps) {
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
});
