"use client";

import { BackgroundGradient } from "@/components/background-gradient";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { InvitationModal } from "@/components/invitation-modal";
import { useUser } from "@/hooks/useUser";
import { getRepository } from "@/lib/data/repositoryFactory";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { Invitation } from "~/db/schema";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user } = useUser();
  const [showInvites, setShowInvites] = useState(true);

  const { data: invitations } = useQuery({
    queryKey: ["invitations", user?.id],
    queryFn: async () => {
      const invitationRepo = await getRepository<Invitation>("invitations");
      return invitationRepo.getAll();
    },
    enabled: !!user?.id,
  });

  const pendingInvitations = invitations?.data.filter(
    (invitation) => invitation.data.status === "pending"
  );

  return (
    <div className="flex h-full">
      <DashboardSidebar />

      <main className="relative flex-1 flex flex-col overflow-hidden h-full bg-background">
        <div className="container mx-auto p-6 space-y-8 h-full">{children}</div>
        <BackgroundGradient />
      </main>
      {showInvites && pendingInvitations?.length && pendingInvitations?.length > 0 && (
        <InvitationModal
          invitations={pendingInvitations.map((i) => i.data)}
          onClose={() => setShowInvites(false)}
        />
      )}
    </div>
  );
}
