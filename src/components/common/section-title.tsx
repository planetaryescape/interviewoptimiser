import type { ReactElement } from "react";
import { cn } from "@/lib/utils";

export type SectionTitleProps = {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  variant?: "h1" | "h2" | "h3" | "h4" | "display"; // Maps to text-style-*
  children: React.ReactNode;
  className?: string;
};

/**
 * A reusable component for rendering section titles with consistent typography.
 * It allows specifying the heading level (h1-h6) via the 'as' prop and the
 * visual style (corresponding to Tailwind text utilities) via the 'variant' prop.
 *
 * @param {SectionTitleProps} props - The props for the component.
 * @param {("h1" | "h2" | "h3" | "h4" | "h5" | "h6")} [props.as="h2"] - The HTML heading element to render.
 * @param {("h1" | "h2" | "h3" | "h4" | "display")} [props.variant="h2"] - The typographic style variant to apply.
 * @param {React.ReactNode} props.children - The content of the section title.
 * @param {string} [props.className] - Optional additional CSS classes.
 * @returns {ReactElement} The rendered section title component.
 */
export const SectionTitle = ({
  as: Component = "h2",
  variant = "h2",
  children,
  className,
}: SectionTitleProps): ReactElement => {
  const styleClass = `text-style-${variant}`;
  return <Component className={cn(styleClass, "text-foreground", className)}>{children}</Component>;
};
