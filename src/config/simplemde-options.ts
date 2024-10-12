import { Options } from "easymde";
import { useTheme } from "next-themes";
import { useMemo } from "react";

export function useSimpleMDEOptions() {
  const { theme } = useTheme();

  return useMemo(() => {
    return {
      autofocus: false,
      spellChecker: false,
      theme: theme === "dark" ? "dark" : "easymde",
      previewClass:
        theme === "dark" ? ["editor-preview-dark"] : ["editor-preview-light"],
      toolbar: [
        "bold",
        "italic",
        "heading",
        "|",
        "unordered-list",
        "ordered-list",
        "|",
        "link",
        "|",
        "undo",
        "redo",
        "|",
        "guide",
      ],
      status: false,
    } as Options;
  }, [theme]);
}
