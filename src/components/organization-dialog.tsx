"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Organization } from "@/db/schema";
import { getRepository } from "@/lib/data/repositoryFactory";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

const INDUSTRY_OPTIONS = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Other",
];

const SIZE_OPTIONS = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

type OrganizationDialogProps = {
  organization?: Organization;
  mode: "create" | "edit";
  onSuccess?: () => void;
};

export function OrganizationDialog({
  organization,
  mode,
  onSuccess,
}: OrganizationDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: organization?.name ?? "",
    description: organization?.description ?? "",
    website: organization?.website ?? "",
    industry: organization?.industry ?? "",
    size: organization?.size ?? "",
  });

  const { mutate: submitOrganization, isPending } = useMutation({
    mutationFn: async (data: typeof formData) => {
      const organizationRepo = await getRepository<Organization>(
        "organizations"
      );
      if (mode === "create") {
        return organizationRepo.create({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        });
      } else {
        return organizationRepo.update(
          idHandler.encode(organization!.id),
          data
        );
      }
    },
    onSuccess: () => {
      toast.success(
        mode === "create"
          ? "Organization created successfully"
          : "Organization updated successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      Sentry.withScope((scope) => {
        scope.setExtra(
          "context",
          mode === "create" ? "createOrganization" : "updateOrganization"
        );
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);
        Sentry.captureException(error);
      });
      toast.error(
        mode === "create"
          ? "Failed to create organization"
          : "Failed to update organization",
        {
          position: "top-center",
          richColors: true,
          duration: 10000,
        }
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Organization name is required");
      return;
    }
    submitOrganization(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={mode === "create" ? "default" : "outline"}>
          {mode === "create" ? "Create Organization" : "Edit Organization"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Organization" : "Edit Organization"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new organization to manage your team and jobs."
              : "Update your organization details."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Organization Name*
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter organization name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter organization description"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="website" className="text-sm font-medium">
              Website
            </label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, website: e.target.value }))
              }
              placeholder="Enter organization website"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="industry" className="text-sm font-medium">
              Industry
            </label>
            <Select
              value={formData.industry}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, industry: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRY_OPTIONS.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="size" className="text-sm font-medium">
              Company Size
            </label>
            <Select
              value={formData.size}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, size: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                {SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                ? "Create Organization"
                : "Update Organization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
