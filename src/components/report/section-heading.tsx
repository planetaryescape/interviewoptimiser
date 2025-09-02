import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  children: ReactNode;
  className?: string;
  headingFont: string;
  variant?: "primary" | "secondary" | "tertiary";
  align?: "left" | "center";
  withUnderline?: boolean;
}

/**
 * A styled heading for report sections
 */
export function SectionHeading({
  children,
  className,
  headingFont,
  variant = "primary",
  align = "left",
  withUnderline = true,
}: SectionHeadingProps) {
  const variants = {
    primary: "text-base font-semibold text-blue-800 uppercase tracking-widest",
    secondary: "text-sm font-semibold text-slate-800 tracking-wide",
    tertiary: "text-sm font-medium text-slate-700",
  };

  const alignments = {
    left: "text-left",
    center: "text-center",
  };

  return (
    <h2
      className={cn(
        variants[variant],
        alignments[align],
        withUnderline && "border-b border-slate-300 pb-2 mb-6",
        !withUnderline && "mb-4",
        headingFont,
        className
      )}
    >
      {children}
    </h2>
  );
}
