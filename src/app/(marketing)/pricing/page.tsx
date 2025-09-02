import { Check, CreditCard } from "lucide-react";
import type Stripe from "stripe";
import { EarlyBirdPromoDiscountBanner } from "@/components/early-bird-promo-discount-banner";
import { SocialProofSection } from "@/components/landing/social-proof-section";
import PricingPageFaq from "@/components/pricing-page-faq";
import { PricingPlanButton } from "@/components/pricing-plan-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { isFomoDiscountActive } from "@/lib/utils/isFomoDiscountActive";
import { config } from "~/config";
import { stripe } from "~/lib/stripe";

type PlanIconKey = keyof typeof planIcons;

const planIcons = {
  "60Min": (
    <svg
      className="w-20 h-20 mb-4"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="60 minute plan icon"
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
  "30Min": (
    <svg
      className="w-20 h-20 mb-4"
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
  "15Min": (
    <svg
      className="w-20 h-20 mb-4"
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
};

export default async function PricingPage() {
  const offerActive = isFomoDiscountActive();

  const products = await stripe.products.list({
    expand: ["data.default_price"],
  });

  const sortedProducts = (products.data || [])
    .filter((product) => product && typeof product === "object")
    .sort((a, b) => {
      const minutesA = Number.parseInt(a.metadata?.minutes || "0", 10);
      const minutesB = Number.parseInt(b.metadata?.minutes || "0", 10);
      return minutesA - minutesB;
    });

  const plans = sortedProducts
    // filter out the plans that are not 15, 30, or 60 minutes
    .filter((product) => ["15 minutes", "30 minutes", "60 minutes"].includes(product.name))
    .map((product) => ({
      name: product.name,
      icon: planIcons[(product.default_price as Stripe.Price)?.lookup_key as PlanIconKey],
      priceId: (product.default_price as Stripe.Price)?.id,
      description: product.description,
      minutes: Number.parseInt(product.metadata?.minutes ?? "0", 10),
      price:
        offerActive && product.metadata?.originalPrice
          ? (product.default_price as Stripe.Price)?.unit_amount || 0
          : ((product.default_price as Stripe.Price)?.unit_amount || 0) *
            (1 - config.fomoDiscountPercentage / 100),
      originalPrice: (product.default_price as Stripe.Price)?.unit_amount || 0,
      duration: 60,
      features: product.marketing_features.map((f) => f.name) || [],
      recommended: product.metadata?.recommended === "true",
    }));

  const features = [
    { id: "feature-1", text: "Adaptive AI interview simulation" },
    { id: "feature-2", text: "Real-time voice interaction" },
    { id: "feature-3", text: "Detailed performance feedback" },
    { id: "feature-4", text: "Customised industry questions" },
    { id: "feature-5", text: "Interview recording & transcript" },
    { id: "feature-6", text: "Skills assessment report" },
  ];

  return (
    <div className="bg-background relative overflow-hidden">
      {/* Hero Section */}
      <section className="pt-16 pb-8 md:pt-24 md:pb-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <Badge className="px-3 py-1 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20">
              <CreditCard className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs font-medium">Simple Pricing</span>
            </Badge>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl mb-4">
            Invest in Your Interview Success
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Flexible plans designed to help you master your next interview with confidence. Choose
            the package that works best for your needs.
          </p>
        </div>
      </section>

      {/* Discount Banner */}
      <EarlyBirdPromoDiscountBanner />

      {/* Pricing Cards Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col rounded-2xl shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden ${
                  plan.recommended ? "border-primary/30" : "border-primary/10"
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <div className="p-6 flex flex-col items-center text-center">
                  <div className="mb-3 text-primary">{plan.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                  <div className="p-4 w-full rounded-md bg-primary/5 text-center mb-6">
                    <p className="text-3xl font-bold text-primary">
                      ${(plan.price / 100).toFixed(2)}
                      {offerActive && plan.originalPrice > plan.price && (
                        <span className="ml-2 text-base line-through text-muted-foreground">
                          ${(plan.originalPrice / 100).toFixed(2)}
                        </span>
                      )}
                    </p>
                    {offerActive && plan.originalPrice > plan.price && (
                      <p className="text-sm font-semibold text-primary mt-1">
                        Save {config.fomoDiscountPercentage}%
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      ${(plan.price / 100 / plan.minutes).toFixed(2)} per minute
                    </p>
                  </div>

                  <div className="space-y-3 mb-6 w-full">
                    {features.map((feature) => (
                      <div key={feature.id} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-left">{feature.text}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-left">
                        <strong>{plan.minutes} minutes</strong> of AI interview time
                      </span>
                    </div>
                  </div>

                  <PricingPlanButton recommended={plan.recommended} priceId={plan.priceId} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <SocialProofSection />

      {/* FAQ Section */}
      <section className="py-12">
        <PricingPageFaq />
      </section>
    </div>
  );
}
