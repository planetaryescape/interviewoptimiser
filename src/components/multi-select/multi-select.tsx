"use client";

import { ChevronDown, WandSparkles, XIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { OptionsList } from "./options-list";
import { SelectedBadges } from "./selected-badges";
import type { MultiSelectProps } from "./types";
import { useMultiSelect } from "./use-multi-select";

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      placeholder = "Select options",
      animation = 0,
      maxCount = 3,
      align = "start",
      modalPopover = false,
      asChild = false,
      className,
      ...props
    },
    ref
  ) => {
    const {
      selectedValues,
      isPopoverOpen,
      isAnimating,
      setIsPopoverOpen,
      setIsAnimating,
      handleInputKeyDown,
      toggleOption,
      handleClear,
      handleTogglePopover,
      clearExtraOptions,
      toggleAll,
    } = useMultiSelect({
      defaultValue,
      options,
      maxCount,
      onValueChange,
    });

    return (
      <>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={modalPopover}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              {...props}
              onClick={handleTogglePopover}
              className={cn(
                "flex w-full p-1 rounded-md border border-gray-400 dark:border-gray-600 min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit",
                className
              )}
            >
              {selectedValues.length > 0 ? (
                <div className="flex justify-between items-center w-full">
                  <SelectedBadges
                    selectedValues={selectedValues}
                    options={options}
                    maxCount={maxCount}
                    isAnimating={isAnimating}
                    animation={animation}
                    variant={variant}
                    onRemove={toggleOption}
                    onClearExtra={clearExtraOptions}
                  />
                  <div className="flex items-center justify-between">
                    <XIcon
                      className="h-4 mx-2 cursor-pointer text-muted-foreground"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleClear();
                      }}
                    />
                    <Separator orientation="vertical" className="flex min-h-6 h-full" />
                    <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full mx-auto">
                  <span className="text-sm text-muted-foreground mx-3">{placeholder}</span>
                  <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
                </div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 border border-gray-400 dark:border-gray-600"
            align={align}
            onEscapeKeyDown={() => setIsPopoverOpen(false)}
          >
            <OptionsList
              options={options}
              selectedValues={selectedValues}
              onToggleOption={toggleOption}
              onToggleAll={toggleAll}
              onClear={handleClear}
              onClose={() => setIsPopoverOpen(false)}
              onInputKeyDown={handleInputKeyDown}
            />
          </PopoverContent>
        </Popover>
        {animation > 0 && selectedValues.length > 0 && (
          <WandSparkles
            className={cn(
              "cursor-pointer my-2 text-foreground bg-background w-3 h-3",
              isAnimating ? "" : "text-muted-foreground"
            )}
            onClick={() => setIsAnimating(!isAnimating)}
          />
        )}
      </>
    );
  }
);

MultiSelect.displayName = "MultiSelect";
