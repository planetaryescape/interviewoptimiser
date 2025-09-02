"use client";

import { useFeatureFlagEnabled } from "posthog-js/react";
import { CustomisationSettings } from "@/components/customisation-settings";

export default function SettingsPage() {
  const _flagEnabled = useFeatureFlagEnabled("organizations");

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="w-full">
        <CustomisationSettings />
      </div>
    </div>
  );
}
