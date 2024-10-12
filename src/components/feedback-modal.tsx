"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NewFeatureRequest } from "@/db/schema";
import { useUser } from "@/hooks/useUser";
import { getRepository } from "@/lib/data/repositoryFactory";
import { useAuth } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { userId } = useAuth();
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const [newFeatureRequest, setNewFeatureRequest] = useState<NewFeatureRequest>(
    {
      userId: user?.id ?? 0,
      title: "",
      content: "",
    }
  );

  const addFeatureRequestMutation = useMutation({
    mutationFn: async (featureRequest: NewFeatureRequest) => {
      const repository = await getRepository<NewFeatureRequest>(
        "feature-requests"
      );
      return repository.create(featureRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureRequests"] });
      toast.success("Thank you for your feedback! We really appreciate it.");
      setNewFeatureRequest({
        userId: user?.id ?? 0,
        title: "",
        content: "",
      });
      onClose();
    },
    onError: (error) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "addFeatureRequestMutation");
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });
      toast.error(`Error submitting feedback: ${error}`);
    },
  });

  const handleSubmit = () => {
    if (!userId) {
      toast.error("You must be signed in to submit feedback.");
      return;
    }
    addFeatureRequestMutation.mutate(newFeatureRequest);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card">
        <DialogHeader>
          <DialogTitle>Feedback & Feature Requests</DialogTitle>
          <DialogDescription>
            We value your input! Use this form to submit feedback or suggest new
            features.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={newFeatureRequest.title ?? ""}
            onChange={(e) =>
              setNewFeatureRequest({
                ...newFeatureRequest,
                title: e.target.value,
              })
            }
            placeholder="Enter feedback title or feature request (optional)"
          />
          <Textarea
            value={newFeatureRequest.content}
            onChange={(e) =>
              setNewFeatureRequest({
                ...newFeatureRequest,
                content: e.target.value,
              })
            }
            placeholder="Describe your feedback or feature request"
          />
          <DialogFooter>
            <Button
              className="ml-auto"
              onClick={handleSubmit}
              disabled={!newFeatureRequest.content}
            >
              Submit Feedback
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
