import type { Components } from "react-markdown";

export const remarkMarkdownComponents: Partial<Components> = {
  ul: ({ children }) => <ul className="list-disc list-inside mb-4">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside mb-4">{children}</ol>,
  p: ({ children }) => <p className="mb-4">{children}</p>,
};
