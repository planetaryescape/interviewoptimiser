"use client";

import { MDXEditorMethods, MDXEditorProps } from "@mdxeditor/editor";
import { forwardRef, Suspense } from "react";
import Editor from "./InitialiseMDXEditor";

export const ForwardRefEditor = forwardRef<MDXEditorMethods, MDXEditorProps>(
  (props, ref) => (
    <Suspense fallback={null}>
      <Editor {...props} editorRef={ref} />
    </Suspense>
  )
);

ForwardRefEditor.displayName = "ForwardRefEditor";
