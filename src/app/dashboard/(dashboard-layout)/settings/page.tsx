"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Customisation, NewCustomisation } from "@/db/schema";
import { useUser } from "@/hooks/useUser";
import { config } from "@/lib/config";
import { getRepository } from "@/lib/data/repositoryFactory";
import { sanitiseUserInputText } from "@/lib/sanitiseUserInputText";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CustomisationSettingsSection() {
  const { data: user, refetch, isLoading } = useUser();
  const [customisation, setCustomisation] = useState<NewCustomisation>({
    id: 0,
    userId: user?.id ?? 0,
    name: "",
    email: "",
    address: "",
    phone: "",
    customInstructions: "",
  });

  useEffect(() => {
    if (user?.customisation) {
      setCustomisation({
        id: user.customisation.id,
        userId: user.customisation.userId,
        name: user.customisation.name,
        email: user.customisation.email,
        address: user.customisation.address,
        phone: user.customisation.phone,
        customInstructions: sanitiseUserInputText(
          user.customisation.customInstructions
        ),
      });
    }
  }, [user]);

  const handleCustomisationChange = (
    field: keyof Customisation,
    value: string
  ) => {
    setCustomisation((prev) => ({ ...prev, [field]: value }));
  };

  const { mutate: saveCustomisations, isPending } = useMutation({
    mutationFn: async (updatedCustomisation: Partial<Customisation>) => {
      const customisationRepo = await getRepository<Customisation>(
        "customisations"
      );
      return customisationRepo.update(
        idHandler.encode(customisation.id ?? 0),
        updatedCustomisation
      );
    },
    onSuccess: () => {
      toast.success("Customisations saved successfully");
      refetch();
    },
    onError: (error, customisation) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "saveCustomisations");
        scope.setExtra("customisation", customisation);
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });
      toast.error("Failed to save customisations", {
        position: "top-center",
        richColors: true,
        duration: 10000,
      });
    },
  });

  if (isLoading) {
    return (
      <div className="size-full flex items-center justify-center">
        <ParticleSwarmLoader />
      </div>
    );
  }

  return (
    <section className="h-full grid grid-rows-[auto_1fr_auto]">
      <div className="flex justify-between items-center mb-4 row-span-1">
        <h2 className="text-2xl font-semibold text-foreground">
          Customization Settings
        </h2>
      </div>
      <Card className="dark:bg-gray-800 border-none">
        <CardContent className="space-y-4">
          <ScrollArea className="flex-1 h-full max-w-[75ch] mx-auto">
            <div className="flex flex-col gap-4">
              <div className="space-y-2 px-4 pt-4">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  value={customisation.name || ""}
                  onChange={(e) =>
                    handleCustomisationChange("name", e.target.value)
                  }
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="space-y-2 px-4">
                <label htmlFor="address" className="text-sm font-medium">
                  Address
                </label>
                <Input
                  id="address"
                  value={customisation.address || ""}
                  onChange={(e) =>
                    handleCustomisationChange("address", e.target.value)
                  }
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="space-y-2 px-4">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone
                </label>
                <Input
                  id="phone"
                  value={customisation.phone || ""}
                  onChange={(e) =>
                    handleCustomisationChange("phone", e.target.value)
                  }
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="space-y-2 px-4">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  value={customisation.email || ""}
                  onChange={(e) =>
                    handleCustomisationChange("email", e.target.value)
                  }
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="space-y-2 px-4">
                <label htmlFor="instructions" className="text-sm font-medium">
                  Custom Instructions for CV Optimisation
                </label>
                <Textarea
                  id="instructions"
                  value={customisation.customInstructions || ""}
                  maxLength={config.maxTextLengths.customisations}
                  onChange={(e) =>
                    handleCustomisationChange(
                      "customInstructions",
                      e.target.value
                    )
                  }
                  rows={4}
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <Button
              onClick={() => saveCustomisations(customisation)}
              disabled={isPending}
              variant="outline"
              className="m-4"
            >
              {isPending ? "Saving..." : "Save Customisations"}
            </Button>
          </ScrollArea>
        </CardContent>
      </Card>
    </section>
  );
}
