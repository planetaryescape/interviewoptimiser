"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Home } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ReviewForm, type ReviewFormData } from "@/components/review-form";
import { Button } from "@/components/ui/button";

export default function SubmitTestimonialPage() {
  const { user } = useUser();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    comment: "",
    twitterUsername: "",
    linkedinUrl: "",
    showOnLanding: true,
    rating: 5,
  });

  useEffect(() => {
    if (user?.firstName || user?.lastName) {
      setReviewForm((prev) => ({
        ...prev,
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || prev.name,
      }));
    }
  }, [user]);

  const { mutate: submitReview, isPending } = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to submit review");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Thank you for your review!");
      setIsSubmitted(true);
    },
    onError: (_error) => {
      toast.error("Failed to submit review. Please try again later.");
    },
  });

  if (isSubmitted) {
    return (
      <div className="container max-w-2xl mx-auto py-12 px-4">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter">Thank You for Your Feedback!</h1>
            <p className="text-muted-foreground">
              Your review helps us improve CV Optimiser and assists other job seekers in making
              informed decisions. We truly appreciate you taking the time to share your experience.
            </p>
            {reviewForm.showOnLanding && (
              <p className="text-sm text-muted-foreground">
                Your review will be visible on our landing page after a brief review.
              </p>
            )}
          </div>
          <Button asChild className="mt-8">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tighter">Share Your Experience</h1>
        <ReviewForm
          formData={reviewForm}
          onFormChange={(data) => setReviewForm((prev) => ({ ...prev, ...data }))}
          onSubmit={() => submitReview(reviewForm)}
          isSubmitting={isPending}
          autoFocus
        />
      </div>
    </div>
  );
}
