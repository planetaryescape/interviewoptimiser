"use client";

import { useAuth } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface PricingCardFooterProps {
  priceId: string;
}

export function PricingCardFooter({ priceId }: PricingCardFooterProps) {
  const { userId } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} disabled={isLoading} className="w-full">
      {isLoading ? "Processing..." : userId ? "Buy" : "Buy"}
    </Button>
  );
}
