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
import * as React from "react";

interface ErrorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRetry: () => void;
  onCancel: () => void;
}

export const ErrorDialog = React.memo(function ErrorDialog({
  isOpen,
  onOpenChange,
  onRetry,
  onCancel,
}: ErrorDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Generation Failed</DialogTitle>
          <DialogDescription>
            We encountered an issue while generating your interview report. Would you like to try
            again?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onRetry}>Try Again</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
