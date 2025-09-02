"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PricingPlanButton } from "@/components/pricing-plan-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isFomoDiscountActive } from "@/lib/utils/isFomoDiscountActive";
import { config } from "~/config";

type PricingPlan = {
  name: string;
  priceId: string;
  minutes: number;
  price: number;
  originalPrice: number;
  recommended: boolean;
  description: string;
};

type TopUpMinutesModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function TopUpMinutesModal({ isOpen, onClose }: TopUpMinutesModalProps) {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offerActive] = useState(() => isFomoDiscountActive());

  useEffect(() => {
    async function fetchPlans() {
      if (!isOpen) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/pricing-plans");
        if (!response.ok) {
          throw new Error("Failed to fetch pricing plans");
        }

        const data = await response.json();
        setPlans(data.plans);
      } catch (_err) {
        setError("Failed to load pricing plans. Please try again or visit the pricing page.");
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, [isOpen]);

  // Clock SVG components
  const planIcons = {
    "15 minutes": (
      <svg
        className="w-16 h-16"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>15 minute plan icon</title>
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="hsl(var(--primary))"
          fillOpacity="0.1"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
        />
        <path
          d="M50 15 L50 50 L67 33"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="50" cy="50" r="3" fill="hsl(var(--primary))" />
      </svg>
    ),
    "30 minutes": (
      <svg
        className="w-16 h-16"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>30 minute plan icon</title>
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="hsl(var(--primary))"
          fillOpacity="0.1"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
        />
        <path
          d="M50 15 L50 50 L85 50"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="50" cy="50" r="3" fill="hsl(var(--primary))" />
      </svg>
    ),
    "60 minutes": (
      <svg
        className="w-16 h-16"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>60 minute plan icon</title>
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="hsl(var(--primary))"
          fillOpacity="0.1"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
        />
        <path
          d="M50 15 L50 50 L50 15"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="50" cy="50" r="3" fill="hsl(var(--primary))" />
      </svg>
    ),
  };

  const getIcon = (planName: string) => {
    return planIcons[planName as keyof typeof planIcons] || planIcons["30 minutes"];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Top Up Your Minutes</DialogTitle>
          <DialogDescription>
            Choose a package to add more minutes to your account
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading plans...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            <p>{error}</p>
            <a href="/pricing" className="text-primary underline mt-4 block">
              Visit pricing page instead
            </a>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3 mt-6">
              {plans.map((plan) => (
                <div
                  key={plan.priceId}
                  className="flex flex-col rounded-xl border border-primary/10 bg-card p-5 shadow-sm hover:shadow-md transition-all relative"
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                      Popular
                    </div>
                  )}
                  <div className="flex items-center justify-center mb-4">{getIcon(plan.name)}</div>
                  <h3 className="text-lg font-semibold text-center mb-2">{plan.name}</h3>
                  <div className="mt-1 p-3 rounded-md bg-primary/5 text-center mb-3">
                    <p className="text-xl font-bold text-primary">
                      ${(plan.price / 100).toFixed(2)}
                      {offerActive && plan.originalPrice > plan.price && (
                        <span className="ml-2 text-sm line-through text-muted-foreground">
                          ${(plan.originalPrice / 100).toFixed(2)}
                        </span>
                      )}
                    </p>
                    {offerActive && plan.originalPrice > plan.price && (
                      <p className="text-sm font-semibold text-foreground mt-1">
                        Save {config.fomoDiscountPercentage}%
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      ${(plan.price / 100 / plan.minutes).toFixed(2)} per minute
                    </p>
                  </div>
                  {plan.description && (
                    <p className="text-xs text-muted-foreground text-center mb-3 line-clamp-2">
                      {plan.description}
                    </p>
                  )}
                  <div className="mt-auto">
                    <PricingPlanButton recommended={plan.recommended} priceId={plan.priceId} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                Need more minutes?{" "}
                <a href="/pricing" className="text-primary hover:underline">
                  View all plans
                </a>
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
