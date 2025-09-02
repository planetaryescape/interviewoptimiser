import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ReportSectionProps {
  children: ReactNode;
  className?: string;
  background?: "white" | "light" | "subtle" | "highlight";
  border?: "none" | "top" | "bottom" | "both" | "box";
  spacing?: "normal" | "tight" | "loose";
}

/**
 * A styled container for report sections
 */
export function ReportSection({
  children,
  className,
  background = "white",
  border = "none",
  spacing = "normal",
}: ReportSectionProps) {
  const backgrounds = {
    white: "bg-white",
    light: "bg-slate-50",
    subtle: "bg-slate-100/50",
    highlight: "bg-blue-50/50",
  };

  const borders = {
    none: "",
    top: "border-t border-slate-200",
    bottom: "border-b border-slate-200",
    both: "border-t border-b border-slate-200",
    box: "border border-slate-200 rounded-sm",
  };

  const spacings = {
    tight: "py-5 px-6",
    normal: "py-8 px-8",
    loose: "py-10 px-8",
  };

  return (
    <section
      className={cn(
        "mb-16 print:mb-10",
        backgrounds[background],
        borders[border],
        spacings[spacing],
        className
      )}
    >
      {children}
    </section>
  );
}
