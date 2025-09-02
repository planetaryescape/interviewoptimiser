import React from "react";
import { cn } from "@/lib/utils";

interface SectionTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  subtitle?: string;
}

const SectionTitle = React.forwardRef<HTMLHeadingElement, SectionTitleProps>(
  ({ children, className, as: Component = "h2", subtitle, ...props }, ref) => {
    return (
      <div className="text-center mb-8 md:mb-12">
        <Component
          ref={ref}
          className={cn("text-3xl md:text-4xl font-bold tracking-tight text-foreground", className)}
          {...props}
        >
          {children}
        </Component>
        {subtitle && (
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        )}
      </div>
    );
  }
);

SectionTitle.displayName = "SectionTitle";
export default SectionTitle;
