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
import { getRepository } from "@/lib/data/repositoryFactory";
import { clientIdHandler } from "@/lib/utils/clientIdHandler";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import type { Invitation } from "~/db/schema";
import { InvitationLine } from "./invitation-line";

type InvitationModalProps = {
  invitations: Invitation[];
  onClose: () => void;
};

export function InvitationModal({ invitations, onClose }: InvitationModalProps) {
  const [open, setOpen] = useState(true);
  const queryClient = useQueryClient();

  const { mutate: respondToInvitation, isPending } = useMutation({
    mutationFn: async ({
      invitationId,
      status,
    }: {
      invitationId: number;
      status: "accepted" | "rejected";
    }) => {
      const invitationRepo = await getRepository<Invitation>("invitations");
      return invitationRepo.update(clientIdHandler.formatId(invitationId), { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Response submitted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit response");
    },
  });

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleResponse = async (invitationId: number, status: "accepted" | "rejected") => {
    respondToInvitation(
      { invitationId, status },
      {
        onSuccess: () => {
          toast.success(`Invitation ${status === "accepted" ? "accepted" : "rejected"}`);
          // If this was the last invitation, close the modal
          if (invitations.length === 1) {
            handleClose();
          }
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Organization Invitations</DialogTitle>
          <DialogDescription>You have pending invitations to join organizations</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {invitations.map((invitation) => (
            <InvitationLine
              key={invitation.id}
              invitation={invitation}
              handleResponse={handleResponse}
              isPending={isPending}
            />
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
