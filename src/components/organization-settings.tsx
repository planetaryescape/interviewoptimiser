"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { useUser } from "@/hooks/useUser";
import { getRepository } from "@/lib/data/repositoryFactory";
import type { Organization, OrganizationMember } from "~/db/schema";
import { OrganizationDialog } from "./organization-dialog";
import { OrganizationInvitations } from "./organization-invitations";

export function OrganizationSettings() {
  const { data: user, isLoading: isUserLoading } = useUser();

  const { data: organizations, isLoading: isOrgsLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const organizationRepo = await getRepository<Organization>("organizations");
      return organizationRepo.getAll();
    },
    enabled: !!user?.id,
  });

  const { data: organizationMembers, isLoading: isMembersLoading } = useQuery({
    queryKey: ["organization-members", user?.id],
    queryFn: async () => {
      const memberRepo = await getRepository<OrganizationMember>("organization-members");
      return memberRepo.getAll();
    },
    enabled: !!user?.id,
  });

  const isLoading = isUserLoading || isOrgsLoading || isMembersLoading;

  if (isLoading) {
    return (
      <div className="size-full flex items-center justify-center">
        <ParticleSwarmLoader />
      </div>
    );
  }

  if (!organizations || organizations.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <h2 className="text-xl font-semibold">No Organization</h2>
        <p className="text-muted-foreground text-center max-w-md">
          You are not part of any organization yet. Create one to start managing your team and jobs.
        </p>
        <OrganizationDialog mode="create" />
      </div>
    );
  }

  const userOrganization = organizations.data[0];
  const organizationMember = organizationMembers?.data.find(
    (member) => member.data.organizationId === userOrganization.data.id
  );
  const isAdmin =
    organizationMember?.data.role === "admin" || organizationMember?.data.role === "owner";

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Organization Settings</h2>
        {isAdmin && <OrganizationDialog mode="edit" organization={userOrganization.data} />}
      </div>

      <Card>
        <CardContent className="pt-6">
          <dl className="divide-y divide-border">
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6">Organization Name</dt>
              <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                {userOrganization.data.name}
              </dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6">Description</dt>
              <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                {userOrganization.data.description || "No description provided"}
              </dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6">Website</dt>
              <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                {userOrganization.data.website || "No website provided"}
              </dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6">Industry</dt>
              <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                {userOrganization.data.industry || "Not specified"}
              </dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6">Company Size</dt>
              <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                {userOrganization.data.size || "Not specified"}
              </dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6">Your Role</dt>
              <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0 capitalize">
                {organizationMember?.data.role || "No role"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {isAdmin && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Organization Members</h3>
          <OrganizationInvitations organization={userOrganization.data} />
        </div>
      )}
    </section>
  );
}
