"use client";

import { FeatureRequestCard } from "@/components/feature-request-card";
import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { Toggle } from "@/components/ui/toggle";
import { FeatureRequest } from "@/db/schema";
import { featureRequestStatusEnum } from "@/db/schema/featureRequests";
import { useUser } from "@/hooks/useUser";
import { getRepository } from "@/lib/data/repositoryFactory";
import { useQuery } from "@tanstack/react-query";
import { FileText, Grid, List } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const ITEMS_PER_PAGE = 9; // 3x3 grid

export default function AdminFeatureRequestsPage() {
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useUser();
  const isAdmin = user?.role === "admin";
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  useEffect(() => {
    if (!isUserLoading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isAdmin, isUserLoading, router]);

  const { data: featureRequestsData, isLoading } = useQuery({
    queryKey: ["feature-requests"],
    queryFn: async () => {
      const repository = await getRepository<
        FeatureRequest & { likesCount: number; hasVoted: boolean }
      >("feature-requests");
      return repository.getAll();
    },
    enabled: isAdmin,
  });

  const featureRequests = useMemo(
    () => featureRequestsData?.data || [],
    [featureRequestsData]
  );

  const filteredFeatureRequests = useMemo(() => {
    if (selectedStatuses.length === 0) return featureRequests;
    return featureRequests.filter((fr) =>
      selectedStatuses.includes(fr.data.status)
    );
  }, [featureRequests, selectedStatuses]);

  if (isUserLoading || isLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ParticleSwarmLoader />
      </div>
    );
  }

  const sortedFeatureRequests = filteredFeatureRequests.sort(
    (a, b) => b.data.likesCount - a.data.likesCount
  );
  const totalPages = Math.ceil(sortedFeatureRequests.length / ITEMS_PER_PAGE);
  const paginatedFeatureRequests = sortedFeatureRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const NoFeatureRequestsPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <FileText className="w-16 h-16 text-muted-foreground mb-4" />
      <h3 className="text-2xl font-semibold mb-2">No feature requests yet</h3>
      <p className="text-muted-foreground mb-4">
        Users haven&apos;t submitted any feature requests yet.
      </p>
    </div>
  );

  const statusOptions = featureRequestStatusEnum.enumValues.map((status) => ({
    label: status.replace("_", " "),
    value: status,
  }));

  return (
    <section className="h-full grid grid-rows-[auto_1fr_auto] overflow-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 flex-wrap gap-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Feature Requests (Admin)
        </h2>
        <div className="flex justify-between w-full md:w-auto items-center space-x-4">
          <MultiSelect
            maxCount={0}
            align="end"
            defaultValue={selectedStatuses}
            options={statusOptions}
            onValueChange={setSelectedStatuses}
            value={selectedStatuses}
            placeholder="Filter by status"
          />
          <div className="flex items-center space-x-2">
            <Toggle
              pressed={viewMode === "grid"}
              onPressedChange={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Toggle>
            <Toggle
              pressed={viewMode === "table"}
              onPressedChange={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Toggle>
          </div>
        </div>
      </div>

      {filteredFeatureRequests.length === 0 ? (
        <NoFeatureRequestsPlaceholder />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] p-4 gap-6 overflow-y-auto bg-card">
          {paginatedFeatureRequests.map((featureRequest) => (
            <FeatureRequestCard
              key={featureRequest.sys.id}
              featureRequest={featureRequest.data}
              isAdmin={true}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-y-auto">
          {/* Implement a table view for feature requests here */}
          <p>Table view not implemented yet</p>
        </div>
      )}

      {filteredFeatureRequests.length > 0 && (
        <div className="mt-4 flex justify-center row-span-1">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
