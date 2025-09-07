"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRepository } from "@/lib/data/repositoryFactory";
import { clientIdHandler } from "@/lib/utils/clientIdHandler";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { add, format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import type { Invitation, NewInvitation, Organization } from "~/db/schema";

type InvitationStatus = "pending" | "accepted" | "rejected" | "expired" | "revoked";

export function OrganizationInvitations({ organization }: { organization: Organization }) {
  const [email, setEmail] = useState("");
  const queryClient = useQueryClient();

  const { data: invitations, isLoading } = useQuery({
    queryKey: ["invitations", organization.id],
    queryFn: async () => {
      const invitationRepo = await getRepository<Invitation>(
        `invitations?organizationId=${organization.id}`
      );
      return invitationRepo.getAll();
    },
  });

  const { mutate: sendInvitation, isPending } = useMutation({
    mutationFn: async (email: string) => {
      const invitationRepo = await getRepository<NewInvitation>("invitations");
      return invitationRepo.create({
        email,
        organizationId: organization.id,
        expiresAt: add(new Date(), { days: 7 }),
      });
    },
    onSuccess: () => {
      toast.success("Invitation sent successfully");
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: () => {
      toast.error("Failed to send invitation");
    },
  });

  const { mutate: revokeInvitation } = useMutation({
    mutationFn: async (invitationId: number) => {
      const invitationRepo = await getRepository<Invitation>("invitations");
      return invitationRepo.update(clientIdHandler.formatId(invitationId), {
        status: "revoked",
      });
    },
    onSuccess: () => {
      toast.success("Invitation revoked successfully");
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: () => {
      toast.error("Failed to revoke invitation");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email is required");
      return;
    }
    sendInvitation(email);
  };

  if (isLoading) {
    return (
      <div className="size-full flex items-center justify-center">
        <ParticleSwarmLoader />
      </div>
    );
  }

  const groupedInvitations = invitations?.data.reduce(
    (acc, invitation) => {
      const status = invitation.data.status as InvitationStatus;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(invitation.data);
      return acc;
    },
    {} as Record<InvitationStatus, (typeof invitations.data)[0]["data"][]>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? "Sending..." : "Send Invitation"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({groupedInvitations?.pending?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({groupedInvitations?.accepted?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({groupedInvitations?.rejected?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="expired">
            Expired ({groupedInvitations?.expired?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="revoked">
            Revoked ({groupedInvitations?.revoked?.length || 0})
          </TabsTrigger>
        </TabsList>

        {(["pending", "accepted", "rejected", "expired", "revoked"] as const).map((status) => (
          <TabsContent key={status} value={status}>
            <Card>
              <CardContent className="pt-6">
                {groupedInvitations?.[status]?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No {status} invitations</p>
                ) : (
                  <div className="space-y-4">
                    {groupedInvitations?.[status]?.map((invitation) => (
                      <div key={invitation.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{invitation.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Expires: {format(new Date(invitation.expiresAt), "MMM d, yyyy")}
                          </p>
                        </div>
                        {status === "pending" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => revokeInvitation(invitation.id)}
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
