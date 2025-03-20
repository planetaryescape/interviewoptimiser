"use client";

import { CustomisationSettings } from "@/components/customisation-settings";
import { OrganizationSettings } from "@/components/organization-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFeatureFlagEnabled } from "posthog-js/react";

export default function SettingsPage() {
  const flagEnabled = useFeatureFlagEnabled("organizations");

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="customisation" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customisation">Customisation</TabsTrigger>
          {flagEnabled && <TabsTrigger value="organization">Organization</TabsTrigger>}
        </TabsList>

        <TabsContent value="customisation" className="mt-6">
          <CustomisationSettings />
        </TabsContent>

        {flagEnabled && (
          <TabsContent value="organization" className="mt-6">
            <OrganizationSettings />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
