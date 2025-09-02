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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import type { Changelog } from "~/db/schema";

export default function ChangelogList() {
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
      <div className="flex items-center justify-center h-screen">
        <ParticleSwarmLoader />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Changelog</h1>
      <div className="relative">
        {/* Timeline */}
        <div className="absolute h-full top-0 bottom-0 left-4 md:left-1/2 w-0.5 bg-gray-200 dark:bg-gray-700" />

        {/* Changelog items */}
        {changelogs?.data.map((changelog, index) => (
          <div
            key={changelog.sys.id}
            className={`flex items-center mb-8 ${index % 2 === 0 && "md:flex-row-reverse"}`}
          >
            <div className="w-full md:w-1/2 pl-8 md:px-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {new Date(changelog.data.date).toLocaleDateString()}
                </p>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  {changelog.data.title}
                </h3>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={remarkMarkdownComponents}
                  className="text-gray-800 dark:text-gray-200"
                >
                  {changelog.data.content}
                </ReactMarkdown>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-gray-500 dark:text-gray-400">Likes: {changelog.data.likes}</p>
                  {user && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        likeMutation.mutate(
                          typeof changelog.sys.id === "number" ? changelog.sys.id : 0
                        )
                      }
                      disabled={likeMutation.isPending}
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Like
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="w-4 h-4 bg-blue-500 rounded-full absolute left-4 md:left-1/2 transform -translate-x-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
