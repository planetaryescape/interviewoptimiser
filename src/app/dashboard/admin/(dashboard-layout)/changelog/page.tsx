"use client";

import { remarkMarkdownComponents } from "@/components/remark-markdown-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { useSimpleMDEOptions } from "@/config/simplemde-options";
import { Changelog, NewChangelog } from "@/db/schema";
import useMarkdownEditor from "@/hooks/useMarkdownEditor";
import { useUser } from "@/hooks/useUser";
import { getRepository } from "@/lib/data/repositoryFactory";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import "easymde/dist/easymde.min.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

export default function AdminChangelogPage() {
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useUser();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isUserLoading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isAdmin, isUserLoading, router]);

  const [newChangelog, setNewChangelog] = useState<NewChangelog>({
    title: "",
    content: "",
  });
  const queryClient = useQueryClient();
  const simpleMDEOptions = useSimpleMDEOptions();
  const SimpleMDEComponent = useMarkdownEditor();

  const { data: changelogs, isLoading } = useQuery({
    queryKey: ["changelogs"],
    queryFn: async () => {
      const repository = await getRepository<Changelog>("changelogs");
      return repository.getAll();
    },
    enabled: isAdmin,
  });

  const addChangelogMutation = useMutation({
    mutationFn: async (changelog: NewChangelog) => {
      const repository = await getRepository<NewChangelog>("changelogs");
      return repository.create({
        ...changelog,
        date: new Date(),
        likes: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["changelogs"] });
      toast.success("Changelog added successfully");
      setNewChangelog({ title: "", content: "" });
    },
    onError: (error) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "addChangelogMutation");
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });
      toast.error(`Error adding changelog: ${error}`);
    },
  });

  if (isUserLoading || isLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ParticleSwarmLoader />
      </div>
    );
  }

  return (
    <section className="h-full grid grid-rows-[auto_1fr_auto] overflow-auto">
      <div className="flex justify-between items-center mb-4 row-span-1">
        <h2 className="text-2xl font-semibold text-foreground">
          Admin Changelog
        </h2>
      </div>

      {/* Add new changelog form */}
      <div className="mb-8 space-y-4 bg-card text-card-foreground p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Add New Changelog
        </h3>
        <Input
          value={newChangelog.title}
          autoFocus
          onChange={(e) =>
            setNewChangelog({ ...newChangelog, title: e.target.value })
          }
          placeholder="Enter changelog title"
        />
        {SimpleMDEComponent && (
          <SimpleMDEComponent
            value={newChangelog.content}
            onChange={(value) =>
              setNewChangelog({ ...newChangelog, content: value })
            }
            options={simpleMDEOptions}
          />
        )}
        <Button
          variant="outline"
          onClick={() => addChangelogMutation.mutate(newChangelog)}
        >
          Add Changelog
        </Button>
      </div>

      {/* Existing changelogs */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-foreground">
          Existing Changelogs
        </h2>
        {changelogs?.data.map((changelog) => (
          <div
            key={changelog.sys.id}
            className="bg-card p-6 rounded-lg shadow mb-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold text-foreground">
                {changelog.data.title}
              </h3>
              <p className="text-muted-foreground">
                {new Date(changelog.data.date).toLocaleDateString()}
              </p>
            </div>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={remarkMarkdownComponents}
              className="text-foreground mb-2"
            >
              {changelog.data.content}
            </ReactMarkdown>
            <p className="text-muted-foreground">
              Likes: {changelog.data.likes}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
