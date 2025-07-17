import * as React from "react";

interface UseMultiSelectProps {
  defaultValue: string[];
  options: { value: string }[];
  maxCount: number;
  onValueChange: (values: string[]) => void;
}

export function useMultiSelect({
  defaultValue,
  options,
  maxCount,
  onValueChange,
}: UseMultiSelectProps) {
  const [selectedValues, setSelectedValues] = React.useState<string[]>(defaultValue);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    setSelectedValues(defaultValue);
  }, [defaultValue]);

  const handleInputKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        setIsPopoverOpen(true);
      } else if (event.key === "Backspace" && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues];
        newSelectedValues.pop();
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
      }
    },
    [selectedValues, onValueChange]
  );

  const toggleOption = React.useCallback(
    (value: string) => {
      const newSelectedValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    },
    [selectedValues, onValueChange]
  );

  const handleClear = React.useCallback(() => {
    setSelectedValues([]);
    onValueChange([]);
  }, [onValueChange]);

  const handleTogglePopover = React.useCallback(() => {
    setIsPopoverOpen((prev) => !prev);
  }, []);

  const clearExtraOptions = React.useCallback(() => {
    const newSelectedValues = selectedValues.slice(0, maxCount);
    setSelectedValues(newSelectedValues);
    onValueChange(newSelectedValues);
  }, [selectedValues, maxCount, onValueChange]);

  const toggleAll = React.useCallback(() => {
    if (selectedValues.length === options.length) {
      handleClear();
    } else {
      const allValues = options.map((option) => option.value);
      setSelectedValues(allValues);
      onValueChange(allValues);
    }
  }, [selectedValues.length, options, handleClear, onValueChange]);

  return {
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
  };
}
