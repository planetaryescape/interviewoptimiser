"use client";

import { Star } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { config } from "~/config";

export interface ReviewFormData {
  name: string;
  comment: string;
  twitterUsername: string;
  linkedinUrl: string;
  showOnLanding: boolean;
  rating: number;
}

interface ReviewFormProps {
  formData: ReviewFormData;
  onFormChange: (data: Partial<ReviewFormData>) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  autoFocus?: boolean;
  submitButtonText?: string;
}

export function ReviewFormContent() {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Your honest feedback helps us improve {config.projectName} and helps others make informed
        decisions. Whether your experience was positive or negative, we value your authentic
        perspective.
      </p>
      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
        <p className="font-medium">Tips for writing a helpful review:</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Be specific about what worked (or didn&apos;t work) for you</li>
          <li>Share how {config.projectName} impacted your job search</li>
          <li>Mention any specific features you found particularly useful</li>
          <li>Suggest improvements if you have any</li>
        </ul>
      </div>
    </div>
  );
}

export function ReviewForm({
  formData,
  onFormChange,
  onSubmit,
  isSubmitting = false,
  autoFocus = false,
  submitButtonText = "Submit Review",
}: ReviewFormProps) {
  // Focus on comment textarea when component mounts if autoFocus is true
  useEffect(() => {
    if (autoFocus) {
      const textarea = document.getElementById("comment-textarea");
      if (textarea) {
        textarea.focus();
      }
    }
  }, [autoFocus]);

  return (
    <div className="space-y-6">
      <ReviewFormContent />

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="rating">Rating</Label>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={`rating-star-${i + 1}`}
                type="button"
                onClick={() => onFormChange({ rating: i + 1 })}
                className={cn(
                  "p-2 rounded-lg hover:bg-accent transition-colors",
                  i < formData.rating ? "text-yellow-500" : "text-muted-foreground"
                )}
              >
                <Star className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onFormChange({ name: e.target.value })}
            placeholder="Your name or 'Anonymous'"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="comment-textarea">Your Experience</Label>
          <Textarea
            id="comment-textarea"
            value={formData.comment}
            onChange={(e) => onFormChange({ comment: e.target.value })}
            placeholder="Share your experience with CV Optimiser..."
            className="min-h-[150px]"
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="twitterUsername">Twitter Username (Optional)</Label>
            <Input
              id="twitterUsername"
              value={formData.twitterUsername}
              onChange={(e) => onFormChange({ twitterUsername: e.target.value })}
              placeholder="@username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn URL (Optional)</Label>
            <Input
              id="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={(e) => onFormChange({ linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/..."
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="showOnLanding"
            checked={formData.showOnLanding}
            onCheckedChange={(checked) => onFormChange({ showOnLanding: checked as boolean })}
          />
          <Label htmlFor="showOnLanding">
            I&apos;m okay with this review being shown on the landing page
          </Label>
        </div>

        <p className="text-sm text-muted-foreground">
          Note: If you prefer to remain anonymous, you can use &quot;Anonymous&quot; as your name or
          a pseudonym. your name or a pseudonym.
        </p>

        <Button type="submit" className="w-full" disabled={isSubmitting} onClick={onSubmit}>
          {isSubmitting ? "Submitting..." : submitButtonText}
        </Button>
      </div>
    </div>
  );
}
