"use client";

import "easymde/dist/easymde.min.css";
import { useEffect, useState } from "react";
import SimpleMDE from "react-simplemde-editor";

export default function useMarkdownEditor() {
  const [SimpleMDEComponent, setSimpleMDEComponent] = useState<
    typeof SimpleMDE | null
  >(null);

  useEffect(() => {
    import("react-simplemde-editor").then((module) => {
      if (typeof window !== "undefined" && document) {
        setSimpleMDEComponent(() => module.default);
      }
    });
  }, []);

  return SimpleMDEComponent;
}
