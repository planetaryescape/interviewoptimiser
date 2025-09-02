"use client";

import type { MDXEditorMethods, MDXEditorProps } from "@mdxeditor/editor";
import { Suspense, forwardRef } from "react";
import Editor from "./InitialiseMDXEditor";

export const ForwardRefEditor = forwardRef<MDXEditorMethods, MDXEditorProps>((props, ref) => (
  <Suspense fallback={null}>
    <Editor {...props} editorRef={ref} />
  </Suspense>
));

ForwardRefEditor.displayName = "ForwardRefEditor";
