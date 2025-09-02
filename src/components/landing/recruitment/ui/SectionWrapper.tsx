import { cn } from "@/lib/utils";
import React from "react";

interface SectionWrapperProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  containerClassName?: string;
  id?: string;
}

const SectionWrapper = React.forwardRef<HTMLElement, SectionWrapperProps>(
  ({ children, className, containerClassName, as: Component = "section", id, ...props }, ref) => {
    return (
      // @ts-ignore - Component is a valid JSX element
      <Component ref={ref} id={id} className={cn("py-12 md:py-16 lg:py-20", className)} {...props}>
        <div className={cn("container mx-auto px-4 md:px-6", containerClassName)}>{children}</div>
      </Component>
    );
  }
);

SectionWrapper.displayName = "SectionWrapper";
export default SectionWrapper;
