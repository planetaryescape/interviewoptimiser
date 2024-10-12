// @ts-expect-error react-markdown is not typed
import { ReactMarkdownOptions } from "react-markdown/lib/react-markdown";

export const remarkMarkdownComponents: ReactMarkdownOptions["components"] = {
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc list-inside mb-4">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal list-inside mb-4">{children}</ol>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="mb-4">{children}</p>
  ),
};
