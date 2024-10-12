"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CVWithRelations } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";

export function PersonalDetailsSection({
  cv,
  setCV,
}: {
  cv: CVWithRelations;
  setCV: Dispatch<SetStateAction<CVWithRelations | null>>;
}) {
  const handleChange = (field: string, value: string) => {
    setCV((prevCV) => {
      if (!prevCV) return null;
      return { ...prevCV, [field]: value };
    });
  };

  return (
    <div className="mb-4 p-4 space-y-4 rounded-md bg-card text-card-foreground border border-gray-300 dark:border-gray-600">
      <h3 className="text-lg text-foreground font-semibold">
        Personal Details
      </h3>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={cv.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={cv.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={cv.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={cv.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={cv.location}
          onChange={(e) => handleChange("location", e.target.value)}
        />
      </div>
    </div>
  );
}
