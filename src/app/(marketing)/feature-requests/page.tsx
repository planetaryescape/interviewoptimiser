"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BackgroundGradient } from "@/components/background-gradient";
import { FeatureRequestCard } from "@/components/feature-request-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSimpleMDEOptions } from "@/config/simplemde-options";
import useMarkdownEditor from "@/hooks/useMarkdownEditor";
import { useUser } from "@/hooks/useUser";
import { getRepository } from "@/lib/data/repositoryFactory";
import "easymde/dist/easymde.min.css";
import { motion } from "framer-motion";
import { ArrowUpCircle, CheckCircle, Filter, Lightbulb, MessageSquare } from "lucide-react";
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
    <div className="bg-background min-h-screen relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-16 pb-8 md:pt-24 md:pb-12">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="mb-4">
            <Badge className="px-3 py-1 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20">
              <Lightbulb className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs font-medium">Community Voice</span>
            </Badge>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl mb-4">
            Feature Requests
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Shape the future of our platform by submitting your ideas and voting on features you
            want to see next.
          </p>
        </div>
        <BackgroundGradient degrees={15} />
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
          {/* Submit Feature Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden border-none shadow-lg">
              <div className="bg-gradient-to-r from-primary/20 to-primary/5 px-6 py-4 border-b">
                {userId ? (
                  <div className="flex items-center space-x-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Lightbulb className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Submit Your Idea</h2>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Lightbulb className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Feature Submission</h2>
                  </div>
                )}
              </div>

              <div className="p-6">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Have an idea for a new feature? Submit it here! If your request gets enough votes
                  and bubbles up to the top, we&apos;ll prioritize it for development.
                </p>

                {userId ? (
                  <div className="space-y-5">
                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium mb-2 text-foreground/80"
                      >
                        Feature Title
                      </label>
                      <Input
                        id="title"
                        value={newFeatureRequest.title ?? ""}
                        onChange={(e) =>
                          setNewFeatureRequest({
                            ...newFeatureRequest,
                            title: e.target.value,
                          })
                        }
                        placeholder="Enter a clear, concise title"
                        className="border-primary/10 focus:border-primary/30 bg-muted/30"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="content-editor"
                        className="block text-sm font-medium mb-2 text-foreground/80"
                      >
                        Feature Description
                      </label>
                      <Suspense
                        fallback={<div className="h-40 animate-pulse bg-muted rounded-md" />}
                      >
                        {SimpleMDEComponent && (
                          <SimpleMDEComponent
                            id="content-editor"
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
                    </div>

                    <Button
                      onClick={() => addFeatureRequestMutation.mutate(newFeatureRequest)}
                      className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Submit Feature Request
                    </Button>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 text-center">
                    <p className="text-foreground/80 mb-5">
                      Sign in to submit your feature requests and vote on ideas from the community.
                    </p>
                    <Button
                      asChild
                      className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                    >
                      <a href="/sign-in">Sign In to Contribute</a>
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Feature Requests Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-none shadow-lg overflow-hidden">
              <Tabs defaultValue="active" className="w-full">
                <div className="bg-gradient-to-r from-primary/20 to-primary/5 px-6 py-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <ArrowUpCircle className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-xl font-semibold">Community Ideas</h2>
                    </div>
                    <TabsList className="bg-background/70 border border-border/30 shadow-sm">
                      <TabsTrigger
                        value="active"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
                      >
                        <span className="flex items-center">
                          <Filter className="mr-1.5 h-4 w-4" />
                          Active Requests
                        </span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="completed"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
                      >
                        <span className="flex items-center">
                          <CheckCircle className="mr-1.5 h-4 w-4" />
                          Implemented
                        </span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                <TabsContent value="active" className="p-0 m-0">
                  <ClerkProvider dynamic>
                    <ScrollArea className="h-[750px] p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 auto-rows-max">
                        {paginatedActiveRequests.length > 0 ? (
                          paginatedActiveRequests.map((featureRequest) => (
                            <FeatureRequestCard
                              key={featureRequest.sys.id}
                              featureRequest={featureRequest.data}
                            />
                          ))
                        ) : (
                          <div className="col-span-full text-center p-12 text-muted-foreground bg-muted/30 rounded-lg border border-border/30">
                            <div className="flex flex-col items-center gap-3">
                              <Lightbulb className="h-10 w-10 text-muted-foreground/50" />
                              <p className="font-medium">
                                No active feature requests yet. Be the first to submit one!
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </ClerkProvider>

                  {activeTotalPages > 1 && (
                    <div className="p-4 border-t flex justify-center">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveCurrentPage((page) => Math.max(1, page - 1))}
                          disabled={activeCurrentPage === 1}
                          className="border-primary/20 hover:bg-primary/5"
                        >
                          Previous
                        </Button>
                        <span className="text-sm font-medium px-4 py-1.5 rounded-md bg-muted/50 border border-border/30">
                          {activeCurrentPage} / {activeTotalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setActiveCurrentPage((page) => Math.min(activeTotalPages, page + 1))
                          }
                          disabled={activeCurrentPage === activeTotalPages}
                          className="border-primary/20 hover:bg-primary/5"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="completed" className="p-0 m-0">
                  <ClerkProvider dynamic>
                    <ScrollArea className="h-[750px] p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 auto-rows-max">
                        {paginatedCompletedRequests.length > 0 ? (
                          paginatedCompletedRequests.map((featureRequest) => (
                            <FeatureRequestCard
                              key={featureRequest.sys.id}
                              featureRequest={featureRequest.data}
                            />
                          ))
                        ) : (
                          <div className="col-span-full text-center p-12 text-muted-foreground bg-muted/30 rounded-lg border border-border/30">
                            <div className="flex flex-col items-center gap-3">
                              <CheckCircle className="h-10 w-10 text-muted-foreground/50" />
                              <p className="font-medium">No completed feature requests yet.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </ClerkProvider>

                  {completedTotalPages > 1 && (
                    <div className="p-4 border-t flex justify-center">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCompletedCurrentPage((page) => Math.max(1, page - 1))}
                          disabled={completedCurrentPage === 1}
                          className="border-primary/20 hover:bg-primary/5"
                        >
                          Previous
                        </Button>
                        <span className="text-sm font-medium px-4 py-1.5 rounded-md bg-muted/50 border border-border/30">
                          {completedCurrentPage} / {completedTotalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCompletedCurrentPage((page) =>
                              Math.min(completedTotalPages, page + 1)
                            )
                          }
                          disabled={completedCurrentPage === completedTotalPages}
                          className="border-primary/20 hover:bg-primary/5"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
