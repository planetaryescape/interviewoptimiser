"use client";

import { remarkMarkdownComponents } from "@/components/remark-markdown-components";
import { Button } from "@/components/ui/button";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { getRepository } from "@/lib/data/repositoryFactory";
import { idHandler } from "@/lib/utils/idHandler";
import { useUser } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ThumbsUp } from "lucide-react";
import { Suspense } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import type { Changelog } from "~/db/schema";

export default function ChangelogPage() {
  const { user, isLoaded } = useUser();
  const queryClient = useQueryClient();

  const { data: changelogs, isLoading } = useQuery({
    queryKey: ["changelogs"],
    queryFn: async () => {
      const repository = await getRepository<Changelog>("changelogs");
      return repository.getAll();
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (changelogId: number) => {
      const repository = await getRepository<Changelog>("changelogs");
      return repository.update(idHandler.encode(changelogId), { likes: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["changelogs"] });
    },
    onError: (error, changelogId) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "likeMutation");
        scope.setExtra("changelogId", changelogId);
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });
      toast.error(`Error liking changelog: ${error}`);
    },
  });

  if (isLoading || !isLoaded) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <ParticleSwarmLoader className="h-16 w-16" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <header className="mb-16 text-center">
        <h1 className="text-4xl font-bold mb-4 tracking-tight text-foreground">Changelog</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
          Track our product updates and improvements as we build a better experience for you.
        </p>
      </header>

      <div className="space-y-12">
        {changelogs?.data.map((changelog) => (
          <article
            key={changelog.sys.id}
            className="relative pl-8 sm:pl-12 border-l-2 border-gray-200 dark:border-gray-800"
          >
            {/* Date marker */}
            <div className="absolute left-0 flex items-center justify-center -translate-x-1/2 rounded-full w-10 h-10 border border-gray-200 dark:border-gray-800 bg-background shadow-sm">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {new Date(changelog.data.date).toLocaleDateString(undefined, { month: "short" })}
              </span>
            </div>

            <div className="group relative">
              {/* Date */}
              <time className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block tracking-wide">
                {new Date(changelog.data.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-foreground tracking-tight">
                {changelog.data.title}
              </h2>

              {/* Content */}
              <div className="prose prose-gray dark:prose-invert prose-sm sm:prose-base max-w-none">
                <Suspense
                  fallback={
                    <div className="h-6 bg-gray-100 dark:bg-gray-800 animate-pulse rounded w-2/3 my-4" />
                  }
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={remarkMarkdownComponents}>
                    {changelog.data.content}
                  </ReactMarkdown>
                </Suspense>
              </div>

              {/* Likes */}
              <div className="flex items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <span
                  aria-label={`${changelog.data.likes} likes`}
                  className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400"
                >
                  <ThumbsUp className="h-4 w-4 mr-1 opacity-70" />
                  {changelog.data.likes}
                </span>

                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-4 text-gray-600 dark:text-gray-400 hover:text-primary"
                    onClick={() => likeMutation.mutate(changelog.sys.id ?? 0)}
                    disabled={likeMutation.isPending}
                    aria-label="Like this update"
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Like
                  </Button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
