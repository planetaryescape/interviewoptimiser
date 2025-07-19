import { useUser } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { PageSettings } from "~/db/schema";
import type { ReviewFormData } from "../review-form";
import type { marginSizes, paperSizes } from "./constants";

interface UseToolbarStateProps {
  onSettingsChange: (settings: Partial<PageSettings>) => Promise<unknown>;
  pageSettings: PageSettings;
  setPaperSize: (size: keyof typeof paperSizes) => void;
  setMarginSize: (size: keyof typeof marginSizes) => void;
  setBodyFont: (font: string) => void;
  setHeadingFont: (font: string) => void;
}

export function useToolbarState({
  onSettingsChange,
  pageSettings,
  setPaperSize,
  setMarginSize,
  setBodyFont,
  setHeadingFont,
}: UseToolbarStateProps) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    name: "",
    comment: "",
    twitterUsername: "",
    linkedinUrl: "",
    showOnLanding: false,
    rating: 5,
  });

  const { mutate: updatePageSettings } = useMutation({
    mutationFn: onSettingsChange,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-settings"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
      queryClient.invalidateQueries({ queryKey: ["job"] });
    },
    onError: (error) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "updatePageSettings");
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });
      toast.error("Failed to update page settings");
    },
  });

  const { mutate: submitReview, isPending: isSubmitting } = useMutation({
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
      setIsReviewDialogOpen(false);
      setReviewForm({
        name: "",
        comment: "",
        twitterUsername: "",
        linkedinUrl: "",
        showOnLanding: false,
        rating: 5,
      });
    },
    onError: (error) => {
      toast.error("Failed to submit review. Please try again later.");
      console.error("Error submitting review:", error);
    },
  });

  const handleSettingChange = useCallback(
    (setting: keyof PageSettings, value: PageSettings[keyof PageSettings]) => {
      updatePageSettings({ [setting]: value });
    },
    [updatePageSettings]
  );

  const handleReviewSubmit = useCallback(() => {
    submitReview(reviewForm);
  }, [submitReview, reviewForm]);

  // Memoize the validated page settings to avoid redundant type assertions
  const validatedPageSettings = useMemo(() => {
    if (!pageSettings) return null;

    return {
      paperSize: pageSettings.paperSize as keyof typeof paperSizes | undefined,
      marginSize: pageSettings.marginSize as keyof typeof marginSizes | undefined,
      bodyFont: pageSettings.bodyFont,
      headingFont: pageSettings.headingFont,
    };
  }, [pageSettings]);

  // Split into separate effects for better performance
  useEffect(() => {
    if (validatedPageSettings?.paperSize) {
      setPaperSize(validatedPageSettings.paperSize);
    }
  }, [validatedPageSettings?.paperSize, setPaperSize]);

  useEffect(() => {
    if (validatedPageSettings?.marginSize) {
      setMarginSize(validatedPageSettings.marginSize);
    }
  }, [validatedPageSettings?.marginSize, setMarginSize]);

  useEffect(() => {
    if (validatedPageSettings?.bodyFont) {
      setBodyFont(validatedPageSettings.bodyFont);
    }
  }, [validatedPageSettings?.bodyFont, setBodyFont]);

  useEffect(() => {
    if (validatedPageSettings?.headingFont) {
      setHeadingFont(validatedPageSettings.headingFont);
    }
  }, [validatedPageSettings?.headingFont, setHeadingFont]);

  useEffect(() => {
    if ((user?.firstName || user?.lastName) && isReviewDialogOpen) {
      setReviewForm((prev) => ({
        ...prev,
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || prev.name,
      }));
    }
  }, [user, isReviewDialogOpen]);

  return {
    isReviewDialogOpen,
    setIsReviewDialogOpen,
    reviewForm,
    setReviewForm,
    handleSettingChange,
    handleReviewSubmit,
    isSubmitting,
  };
}
