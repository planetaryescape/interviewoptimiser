"use client";

import { cn } from "@/lib/utils";
import * as Sentry from "@sentry/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "./ui/button";

export const PricingPlanButton = ({
  recommended,
  priceId,
}: {
  recommended: boolean;
  priceId: string;
}) => {
  const router = useRouter();

  const handleCheckout = async (priceId: string) => {
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      const { url } = await response.json();

      if (url) {
        router.push(url);
      } else {
        toast.error("Error creating checkout session");
      }
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "handleCheckout");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });
      toast.error("Error creating checkout session");
      console.error("Error creating checkout session:", error);
    }
  };
  return (
    <Button
      onClick={() => handleCheckout(priceId)}
      className={cn(
        "mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold shadow-sm transition-colors",
        recommended
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-primary/10 text-primary hover:bg-primary/20"
      )}
    >
      Get started
    </Button>
  );
};
