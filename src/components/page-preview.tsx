"use client";

import type React from "react";
import { forwardRef, type ReactNode } from "react";
import { mmToPx } from "@/lib/unit-conversions";
import { cn } from "@/lib/utils";

interface PagePreviewProps {
  children: ReactNode;
  pageWidth: number;
  pageHeight: number;
  margin: number;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  bodyFont: string;
  headingFont: string;
  scale?: number;
  noBorder?: boolean;
}

const PagePreview = forwardRef<HTMLDivElement, PagePreviewProps>(
  (
    { children, className, id, pageWidth, pageHeight, margin, bodyFont, scale, noBorder = false },
    ref
  ) => {
    const pageWidthPx = mmToPx(pageWidth);
    const pageHeightPx = mmToPx(pageHeight);
    const marginPx = mmToPx(margin);
    const innerContainerHeight = pageHeightPx - 2 * marginPx;

    return (
      <div
        ref={ref}
        id={id}
        className={cn(
          "relative mx-auto shadow-lg overflow-hidden bg-white flex flex-col text-[11pt] transform origin-top-left",
          className,
          noBorder ? "border-none" : "border border-gray-300"
        )}
        style={{
          width: `${pageWidthPx}px`,
          scale: scale,
        }}
      >
        <div
          id={"page-0"}
          className={cn("flex-1 text-black", bodyFont)}
          style={{
            height: innerContainerHeight,
            margin: `${marginPx}px`,
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);

PagePreview.displayName = "PagePreview";

export default PagePreview;
