"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { useUser } from "@/hooks/useUser";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function JobsPage() {
  const router = useRouter();
  const { data: user, isLoading } = useUser();

  // Redirect if user is not part of an organization
  useEffect(() => {
    if (!isLoading && !user?.organizationMemberships.length) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <ParticleSwarmLoader />
      </div>
    );
  }

  if (!user?.organizationMemberships.length) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Jobs</h1>
        <Link href="/dashboard/jobs/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Job
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <div className="text-center text-muted-foreground py-8">
          No jobs created yet. Click the Create Job button to get started.
        </div>
      </Card>
    </div>
  );
}
