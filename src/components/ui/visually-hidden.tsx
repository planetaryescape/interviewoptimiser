"use client";

import type * as React from "react";

import { cn } from "@/lib/utils";

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {}

/**
 * A component that visually hides content while keeping it accessible to screen readers.
 * This is useful for providing additional context to screen reader users without affecting the visual layout.
 */
export function VisuallyHidden({ children, className, ...props }: VisuallyHiddenProps) {
  return (
    <span
      className={cn(
        "absolute w-[1px] h-[1px] p-0 -m-[1px] overflow-hidden clip-rect-0 whitespace-nowrap border-0",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
