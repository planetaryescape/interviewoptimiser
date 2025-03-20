"use client";

import { FeatureRequestCard } from "@/components/feature-request-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSimpleMDEOptions } from "@/config/simplemde-options";
import useMarkdownEditor from "@/hooks/useMarkdownEditor";
import { useUser } from "@/hooks/useUser";
import { getRepository } from "@/lib/data/repositoryFactory";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import "easymde/dist/easymde.min.css";
import { Suspense, useMemo, useState } from "react";
import { toast } from "sonner";
import type { FeatureRequest, NewFeatureRequest } from "~/db/schema";

const ITEMS_PER_PAGE = 6;

export default function FeatureRequestsPage() {
  const { userId, isLoaded } = useAuth();
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const [newFeatureRequest, setNewFeatureRequest] = useState<NewFeatureRequest>({
    title: "",
    content: "",
    userId: user?.id ?? 0,
  });
  const [activeCurrentPage, setActiveCurrentPage] = useState(1);
  const [completedCurrentPage, setCompletedCurrentPage] = useState(1);

  const SimpleMDEComponent = useMarkdownEditor();

  const simpleMDEOptions = useSimpleMDEOptions();

  const { data: featureRequests, isLoading } = useQuery({
    queryKey: ["feature-requests"],
    queryFn: async () => {
      const repository = await getRepository<
        FeatureRequest & { likesCount: number; hasVoted: boolean }
      >("feature-requests");
      return repository.getAll();
    },
  });

  const addFeatureRequestMutation = useMutation({
    mutationFn: async (featureRequest: NewFeatureRequest) => {
      const repository = await getRepository<NewFeatureRequest>("feature-requests");
      return repository.create(featureRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-requests"] });
      toast.success("Feature request submitted successfully");
      setNewFeatureRequest({ title: "", content: "", userId: user?.id ?? 0 });
    },
    onError: (error, featureRequest) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "addFeatureRequestMutation");
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);
        scope.setExtra("featureRequest", featureRequest);

        Sentry.captureException(error);
      });
      toast.error(`Error submitting feature request: ${error}`);
    },
  });

  const sortedFeatureRequests = useMemo(() => {
    return featureRequests?.data.sort((a, b) => b.data.likesCount - a.data.likesCount) || [];
  }, [featureRequests]);

  const activeFeatureRequests = useMemo(() => {
    return sortedFeatureRequests.filter((fr) => fr.data.status !== "completed");
  }, [sortedFeatureRequests]);

  const completedFeatureRequests = useMemo(() => {
    return sortedFeatureRequests.filter((fr) => fr.data.status === "completed");
  }, [sortedFeatureRequests]);

  const paginatedActiveRequests = activeFeatureRequests.slice(
    (activeCurrentPage - 1) * ITEMS_PER_PAGE,
    activeCurrentPage * ITEMS_PER_PAGE
  );

  const paginatedCompletedRequests = completedFeatureRequests.slice(
    (completedCurrentPage - 1) * ITEMS_PER_PAGE,
    completedCurrentPage * ITEMS_PER_PAGE
  );

  const activeTotalPages = Math.ceil(activeFeatureRequests.length / ITEMS_PER_PAGE);
  const completedTotalPages = Math.ceil(completedFeatureRequests.length / ITEMS_PER_PAGE);

  if (isLoading || !isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <ParticleSwarmLoader />
      </div>
    );
  }

  return (
    <section className="h-full grid grid-rows-[auto_1fr] overflow-hidden p-8">
      <h1 className="text-3xl font-bold mb-8">Feature Requests</h1>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-4 overflow-hidden h-full">
        <div className="overflow-y-auto">
          <div className="bg-card p-6 rounded-lg shadow">
            {userId ? (
              <h2 className="text-2xl font-semibold mb-4">Submit a Feature Request</h2>
            ) : null}
            <p className="mb-4 text-card-foreground">
              Have an idea for a new feature? Submit it here! If your request gets enough votes and
              bubbles up to the top, we&apos;ll prioritize it. Only signed in users can submit
              feature requests.
            </p>
            {userId ? (
              <>
                <Input
                  value={newFeatureRequest.title ?? ""}
                  onChange={(e) =>
                    setNewFeatureRequest({
                      ...newFeatureRequest,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter feature request title (optional)"
                  className="mb-4"
                />
                <Suspense fallback={<div>Loading editor...</div>}>
                  {SimpleMDEComponent && (
                    <SimpleMDEComponent
                      value={newFeatureRequest.content}
                      onChange={(value) =>
                        setNewFeatureRequest({
                          ...newFeatureRequest,
                          content: value,
                        })
                      }
                      options={simpleMDEOptions}
                      className="mb-4"
                    />
                  )}
                </Suspense>
                <Button onClick={() => addFeatureRequestMutation.mutate(newFeatureRequest)}>
                  Submit Feature Request
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">Please sign in to submit a feature request.</p>
            )}
          </div>
        </div>

        <Tabs defaultValue="active" className="w-full h-full">
          <TabsList className="grid w-full grid-cols-2 bg-card">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="bg-card">
            <ClerkProvider dynamic>
              <ScrollArea className="size-full row-span-1 bg-card text-card-foreground p-4">
                <div className="size-full grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 auto-rows-max">
                  {paginatedActiveRequests.map((featureRequest) => (
                    <FeatureRequestCard
                      key={featureRequest.sys.id}
                      featureRequest={featureRequest.data}
                    />
                  ))}
                </div>
              </ScrollArea>
            </ClerkProvider>
            <div className="mt-4 flex justify-center">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={activeCurrentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {activeCurrentPage} of {activeTotalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setActiveCurrentPage((page) => Math.min(activeTotalPages, page + 1))
                  }
                  disabled={activeCurrentPage === activeTotalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="completed" className="bg-card">
            <ClerkProvider dynamic>
              <ScrollArea className="size-full row-span-1 bg-card text-card-foreground p-4">
                <div className="size-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
                  {paginatedCompletedRequests.map((featureRequest) => (
                    <FeatureRequestCard
                      key={featureRequest.sys.id}
                      featureRequest={featureRequest.data}
                    />
                  ))}
                </div>
              </ScrollArea>
            </ClerkProvider>
            <div className="mt-4 flex justify-center">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCompletedCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={completedCurrentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {completedCurrentPage} of {completedTotalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCompletedCurrentPage((page) => Math.min(completedTotalPages, page + 1))
                  }
                  disabled={completedCurrentPage === completedTotalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
