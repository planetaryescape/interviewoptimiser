"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import * as React from "react";
import type { MultiSelectOption } from "./types";

interface OptionsListProps {
  options: MultiSelectOption[];
  selectedValues: string[];
  onToggleOption: (value: string) => void;
  onToggleAll: () => void;
  onClear: () => void;
  onClose: () => void;
  onInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const OptionsList = React.memo(function OptionsList({
  options,
  selectedValues,
  onToggleOption,
  onToggleAll,
  onClear,
  onClose,
  onInputKeyDown,
}: OptionsListProps) {
  return (
    <Command>
      <CommandInput placeholder="Search..." onKeyDown={onInputKeyDown} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          <CommandItem key="all" onSelect={onToggleAll} className="cursor-pointer">
            <div
              className={cn(
                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                selectedValues.length === options.length
                  ? "bg-primary text-primary-foreground"
                  : "opacity-50 [&_svg]:invisible"
              )}
            >
              <CheckIcon className="h-4 w-4" />
            </div>
            <span>(Select All)</span>
          </CommandItem>
          {options.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <CommandItem
                key={option.value}
                onSelect={() => onToggleOption(option.value)}
                className="cursor-pointer"
              >
                <div
                  className={cn(
                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "opacity-50 [&_svg]:invisible"
                  )}
                >
                  <CheckIcon className="h-4 w-4" />
                </div>
                {option.icon && <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                <span>{option.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup>
          <div className="flex items-center justify-between">
            {selectedValues.length > 0 && (
              <>
                <CommandItem onSelect={onClear} className="flex-1 justify-center cursor-pointer">
                  Clear
                </CommandItem>
                <Separator orientation="vertical" className="flex min-h-6 h-full" />
              </>
            )}
            <CommandItem
              onSelect={onClose}
              className="flex-1 justify-center cursor-pointer max-w-full"
            >
              Close
            </CommandItem>
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
});
