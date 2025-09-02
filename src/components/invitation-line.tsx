"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { getRepository } from "@/lib/data/repositoryFactory";
import { idHandler } from "@/lib/utils/idHandler";
import type { Invitation, Organization } from "~/db/schema";

type InvitationModalProps = {
  invitation: Invitation;
  handleResponse: (invitationId: number, status: "accepted" | "rejected") => void;
  isPending: boolean;
};

export function InvitationLine({ invitation, handleResponse, isPending }: InvitationModalProps) {
  const { data: organization } = useQuery({
    queryKey: ["organization", invitation.organizationId],
    queryFn: async () => {
      const organizationRepo = await getRepository<Organization>("organizations");
      return organizationRepo.getById(idHandler.encode(invitation.organizationId));
    },
    enabled: !!invitation.organizationId,
  });

  return (
    <div key={invitation.id} className="flex flex-col space-y-2 border-b pb-4 last:border-0">
      <p className="font-medium">
        You&apos;ve been invited to join{" "}
        <span className="font-semibold">{organization?.data.name}</span>
      </p>
      <p className="text-sm text-muted-foreground">
        Expires: {format(new Date(invitation.expiresAt), "MMM d, yyyy")}
      </p>
      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          onClick={() => handleResponse(invitation.id, "accepted")}
          disabled={isPending}
        >
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleResponse(invitation.id, "rejected")}
          disabled={isPending}
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
