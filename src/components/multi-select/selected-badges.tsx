"use client";

import { XCircle } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MultiSelectOption } from "./types";
import { multiSelectVariants } from "./variants";

interface SelectedBadgesProps {
  selectedValues: string[];
  options: MultiSelectOption[];
  maxCount: number;
  isAnimating: boolean;
  animation: number;
  variant?: "default" | "secondary" | "destructive" | "inverted" | null;
  onRemove: (value: string) => void;
  onClearExtra: () => void;
}

export const SelectedBadges = React.memo(function SelectedBadges({
  selectedValues,
  options,
  maxCount,
  isAnimating,
  animation,
  variant,
  onRemove,
  onClearExtra,
}: SelectedBadgesProps) {
  return (
    <div className="flex flex-wrap items-center">
      {selectedValues.slice(0, maxCount).map((value) => {
        const option = options.find((o) => o.value === value);
        const IconComponent = option?.icon;
        return (
          <Badge
            key={value}
            className={cn(isAnimating ? "animate-bounce" : "", multiSelectVariants({ variant }))}
            style={{ animationDuration: `${animation}s` }}
          >
            {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
            {option?.label}
            <XCircle
              className="ml-2 h-4 w-4 cursor-pointer"
              onClick={(event) => {
                event.stopPropagation();
                onRemove(value);
              }}
            />
          </Badge>
        );
      })}
      {selectedValues.length > maxCount && (
        <Badge
          className={cn(
            "bg-transparent text-foreground border-foreground/1 hover:bg-transparent",
            isAnimating ? "animate-bounce" : "",
            multiSelectVariants({ variant })
          )}
          style={{ animationDuration: `${animation}s` }}
        >
          {`+ ${selectedValues.length - maxCount} more`}
          <XCircle
            className="ml-2 h-4 w-4 cursor-pointer"
            onClick={(event) => {
              event.stopPropagation();
              onClearExtra();
            }}
          />
        </Badge>
      )}
    </div>
  );
});
