"use client";

import { Card, CardDescription, CardTitle } from "@/components/acertenity-card";
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
import { FeatureRequest } from "@/db/schema";
import { featureRequestStatusEnum } from "@/db/schema/featureRequests";
import { getRepository } from "@/lib/data/repositoryFactory";
import { cn } from "@/lib/utils";
import { idHandler } from "@/lib/utils/idHandler";
import { useAuth } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ThumbsUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
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
      const repository = await getRepository<FeatureRequest>(
        "feature-requests"
      );
      return repository.update(idHandler.encode(featureRequestId), {});
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
      const repository = await getRepository<FeatureRequest>(
        "feature-requests"
      );
      return repository.update(idHandler.encode(id), {
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

  const getStatusColor = (
    status: (typeof featureRequestStatusEnum.enumValues)[number]
  ) => {
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
    <Card className={cn("transition-all duration-300 flex flex-col relative")}>
      <div className="absolute top-2 right-2">
        <div className="text-xs">
          <Badge
            variant="secondary"
            className={cn("capitalize", getStatusColor(featureRequest.status))}
          >
            {featureRequest.status.replace("_", " ")}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold mb-1">
          {featureRequest.title || "Untitled Feature Request"}
        </CardTitle>
        {isAdmin && featureRequest.user && (
          <p className="text-sm text-muted-foreground">
            Submitted by: {featureRequest.user.username}
          </p>
        )}
        <time className="text-sm text-muted-foreground">
          Date: {new Date(featureRequest.createdAt).toLocaleDateString()}
        </time>
      </CardHeader>
      <CardContent>
        <CardDescription>
          <div className="space-y-3">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={remarkMarkdownComponents}
              className="text-sm text-card-foreground"
            >
              {featureRequest.content}
            </ReactMarkdown>
          </div>
        </CardDescription>
      </CardContent>
      <div className="mt-auto p-4 bg-muted/50 border-t border-gray-300 dark:border-gray-700 flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {featureRequest.likesCount} likes
        </p>
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
            <SelectTrigger className="w-[180px]">
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
            variant="outline"
            size="sm"
            onClick={() => voteMutation.mutate(featureRequest.id)}
            disabled={voteMutation.isPending || featureRequest.hasVoted}
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            {featureRequest.hasVoted ? "Voted" : "Vote"}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
