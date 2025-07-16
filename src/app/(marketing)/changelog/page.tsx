"use client";

import { BackgroundGradient } from "@/components/background-gradient";
import { remarkMarkdownComponents } from "@/components/remark-markdown-components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { getRepository } from "@/lib/data/repositoryFactory";
import { idHandler } from "@/lib/utils/idHandler";
import { useUser } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Clock, Lightbulb, ThumbsUp } from "lucide-react";
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
    <div className="bg-background min-h-screen relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-16 pb-8 md:pt-24 md:pb-12">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="mb-4">
            <Badge className="px-3 py-1 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs font-medium">Product Updates</span>
            </Badge>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl mb-4">
            Changelog
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Track our product updates and improvements as we build a better experience for you.
          </p>
        </div>
        <BackgroundGradient degrees={75} />
      </section>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-12">
          {changelogs?.data.length === 0 ? (
            <div className="text-center p-12 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex flex-col items-center gap-3">
                <Lightbulb className="h-10 w-10 text-muted-foreground/50" />
                <p className="font-medium">No updates yet. Check back soon!</p>
              </div>
            </div>
          ) : (
            changelogs?.data.map((changelog) => (
              <motion.div
                key={changelog.sys.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="overflow-hidden border-none shadow-lg relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/30 to-primary/10" />
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <time className="text-sm font-medium text-muted-foreground tracking-wide">
                        {new Date(changelog.data.date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                    </div>

                    <h2 className="text-2xl font-semibold mb-5 tracking-tight text-foreground">
                      {changelog.data.title}
                    </h2>

                    <div className="bg-muted/30 rounded-md p-5 mb-5">
                      <div className="prose prose-gray dark:prose-invert prose-sm sm:prose-base max-w-none">
                        <Suspense
                          fallback={
                            <div className="h-6 bg-muted animate-pulse rounded w-2/3 my-4" />
                          }
                        >
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={remarkMarkdownComponents}
                          >
                            {changelog.data.content}
                          </ReactMarkdown>
                        </Suspense>
                      </div>
                    </div>

                    <div className="flex items-center pt-4 border-t border-border/30">
                      <div className="flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-2 text-primary/70" />
                        <span className="text-sm font-medium">{changelog.data.likes}</span>
                      </div>

                      {user && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-4 border-primary/20 hover:bg-primary/5"
                          onClick={() =>
                            likeMutation.mutate(
                              typeof changelog.sys.id === "number" ? changelog.sys.id : 0
                            )
                          }
                          disabled={likeMutation.isPending}
                          aria-label="Like this update"
                        >
                          <ThumbsUp className="mr-2 h-4 w-4" />
                          Like
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
