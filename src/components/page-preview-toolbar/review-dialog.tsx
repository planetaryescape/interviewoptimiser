"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import * as React from "react";
import { ReviewForm, type ReviewFormData } from "../review-form";

interface ReviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reviewForm: ReviewFormData;
  onFormChange: (data: Partial<ReviewFormData>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const ReviewDialog = React.memo(function ReviewDialog({
  isOpen,
  onOpenChange,
  reviewForm,
  onFormChange,
  onSubmit,
  isSubmitting,
}: ReviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full h-full sm:h-[90vh] sm:max-w-[90vw] sm:max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Leave a Review</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-6 py-4 px-2">
            <div className="max-w-2xl mx-auto">
              <ReviewForm
                formData={reviewForm}
                onFormChange={(data) => onFormChange(data)}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
                autoFocus
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
