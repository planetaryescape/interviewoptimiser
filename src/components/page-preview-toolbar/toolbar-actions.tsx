"use client";

import { Loader2, RefreshCw, Share, StarIcon } from "lucide-react";
import { useFeatureFlagEnabled } from "posthog-js/react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToolbarItem } from "./toolbar-item";

interface ToolbarActionsProps {
  includeTranscript: boolean;
  setIncludeTranscript: (value: boolean) => void;
  onShare: (option: "pdf" | "docx" | "link") => void;
  isSharing: boolean;
  onReviewClick: () => void;
  onRegenerate?: () => Promise<void>;
}

export const ToolbarActions = React.memo(function ToolbarActions({
  includeTranscript,
  setIncludeTranscript,
  onShare,
  isSharing,
  onReviewClick,
  onRegenerate,
}: ToolbarActionsProps) {
  const regenerateButtonEnabled = useFeatureFlagEnabled("regenerate_button");

  return (
    <div className="flex items-center gap-3">
      <ToolbarItem label="Include Transcript">
        <div className="flex items-center space-x-2 h-9">
          <Switch
            id="transcript-toggle"
            checked={includeTranscript}
            onCheckedChange={setIncludeTranscript}
            className="data-[state=checked]:bg-primary"
          />
          <Label htmlFor="transcript-toggle" className="text-xs font-medium">
            {includeTranscript ? "On" : "Off"}
          </Label>
        </div>
      </ToolbarItem>

      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isSharing} className="transition-colors">
              {isSharing ? (
                <Loader2 className="h-4 w-4 animate-spin md:mr-2" />
              ) : (
                <Share className="h-4 w-4 md:mr-2" />
              )}
              <span className="hidden sm:inline">Share</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
            <DropdownMenuItem onClick={() => onShare("pdf")}>Share as PDF</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare("link")}>Share Link</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" onClick={onReviewClick} className="transition-colors">
          <StarIcon className="h-4 w-4 md:mr-2 text-yellow-500" />
          <span className="hidden sm:inline">Review</span>
        </Button>

        {regenerateButtonEnabled && onRegenerate && (
          <Button variant="outline" size="sm" onClick={onRegenerate}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
        )}
      </div>
    </div>
  );
});
