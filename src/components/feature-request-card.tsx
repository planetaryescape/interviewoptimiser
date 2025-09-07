"use client";

import { Card, CardTitle } from "@/components/acertenity-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRepository } from "@/lib/data/repositoryFactory";
import { cn } from "@/lib/utils";
import { clientIdHandler } from "@/lib/utils/clientIdHandler";
import { useAuth } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, ThumbsUp, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import type { FeatureRequest } from "~/db/schema";
import { featureRequestStatusEnum } from "~/db/schema/featureRequests";
import { remarkMarkdownComponents } from "./remark-markdown-components";

export function FeatureRequestCard({
  featureRequest,
  isAdmin = false,
}: {
  featureRequest: FeatureRequest & {
    user?: { username: string };
    likesCount: number;
    hasVoted: boolean;
  };
  isAdmin?: boolean;
}) {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: async (featureRequestId: number) => {
      const repository = await getRepository<FeatureRequest>("feature-requests");
      return repository.update(clientIdHandler.formatId(featureRequestId), {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-requests"] });
      toast.success("Vote updated successfully");
    },
    onError: (error) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "voteMutation");
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });
      toast.error(`Error updating vote: ${error}`);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const repository = await getRepository<FeatureRequest>("feature-requests");
      return repository.update(clientIdHandler.formatId(id), {
        status: status as FeatureRequest["status"],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-requests"] });
      toast.success("Status updated successfully");
    },
    onError: (error) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "updateStatusMutation");
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });
      toast.error(`Error updating status: ${error}`);
    },
  });

  const getStatusColor = (status: (typeof featureRequestStatusEnum.enumValues)[number]) => {
    switch (status) {
      case "submitted":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800";
      case "triaged":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-800";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800";
      case "declined":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800";
    }
  };

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
      <Card
        className={cn(
          "h-full border-none shadow-md overflow-hidden flex flex-col relative bg-card/60 backdrop-blur-sm"
        )}
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/30 to-primary/10" />
        <div className="absolute top-4 right-4 z-10">
          <Badge
            variant="secondary"
            className={cn("capitalize shadow-sm", getStatusColor(featureRequest.status))}
          >
            {featureRequest.status.replace("_", " ")}
          </Badge>
        </div>

        <CardHeader className="pb-2 pt-6">
          <CardTitle className="text-xl font-medium mb-2 pr-28">
            {featureRequest.title || "Untitled Feature Request"}
          </CardTitle>

          <div className="flex flex-col space-y-1.5 text-sm">
            {isAdmin && featureRequest.user && (
              <div className="flex items-center text-muted-foreground">
                <User className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                <span>{featureRequest.user.username}</span>
              </div>
            )}
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
              <time>{new Date(featureRequest.createdAt).toLocaleDateString()}</time>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-4 flex-grow">
          <div className="bg-muted/30 rounded-md p-3 max-h-60 overflow-auto">
            <div className="space-y-3">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={remarkMarkdownComponents}
                className="text-sm text-card-foreground prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-headings:my-2"
              >
                {featureRequest.content}
              </ReactMarkdown>
            </div>
          </div>
        </CardContent>

        <div className="p-4 border-t border-border/40 flex justify-between items-center bg-gradient-to-b from-muted/10 to-muted/30">
          <div className="flex items-center space-x-1.5">
            <ThumbsUp className="h-4 w-4 text-primary/70" />
            <span className="text-sm font-medium">{featureRequest.likesCount}</span>
          </div>

          {isAdmin ? (
            <Select
              onValueChange={(value) =>
                updateStatusMutation.mutate({
                  id: featureRequest.id,
                  status: value,
                })
              }
              defaultValue={featureRequest.status}
            >
              <SelectTrigger className="w-[180px] h-9 bg-background/80 border-primary/20">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                {featureRequestStatusEnum.enumValues.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : userId ? (
            <Button
              variant={featureRequest.hasVoted ? "secondary" : "default"}
              size="sm"
              onClick={() => voteMutation.mutate(featureRequest.id)}
              disabled={voteMutation.isPending || featureRequest.hasVoted}
              className={
                featureRequest.hasVoted
                  ? "bg-muted/70"
                  : "bg-gradient-to-r from-primary to-primary/90"
              }
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              {featureRequest.hasVoted ? "Voted" : "Vote"}
            </Button>
          ) : null}
        </div>
      </Card>
    </motion.div>
  );
}
