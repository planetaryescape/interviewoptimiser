import EarlyBirdPromoDiscountBanner from "@/components/early-bird-promo-discount-banner";
import PricingPageFaq from "@/components/pricing-page-faq";
import { PricingPlanButton } from "@/components/pricing-plan-button";
import { config } from "@/lib/config";
import { stripe } from "@/lib/stripe";
import { isFomoDiscountActive } from "@/lib/utils/isFomoDiscountActive";
import Stripe from "stripe";

type PlanIconKey = keyof typeof planIcons;

const planIcons = {
  "60Min": (
    <svg
      className="w-20 h-20 mb-4"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
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
      const minutesA = parseInt(a.metadata?.minutes || "0", 10);
      const minutesB = parseInt(b.metadata?.minutes || "0", 10);
      return minutesA - minutesB;
    });

  const plans = sortedProducts.map((product) => ({
    name: product.name,
    icon: planIcons[
      (product.default_price as Stripe.Price)?.lookup_key as PlanIconKey
    ],
    priceId: (product.default_price as Stripe.Price)?.id,
    description: product.description,
    minutes: parseInt(product.metadata?.minutes ?? "0", 10),
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

  return (
    <div className="min-h-screen bg-gradient-to-tl from-[hsl(260,20%,90%)] to-[hsl(240,15%,98%)] dark:from-[hsl(240,15%,10%)] dark:to-[hsl(260,15%,20%)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl sm:tracking-tight lg:text-6xl">
            Boost Your Interview Confidence
          </h1>
          <p className="mt-5 text-xl text-muted-foreground">
            Flexible Pricing Plans for Every Need
          </p>
        </div>

        <EarlyBirdPromoDiscountBanner />

        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative flex flex-col rounded-2xl border border-primary/10 bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}
              <div className="mb-5 flex flex-col items-center">
                <div className="text-primary">{plan.icon}</div>
                <h3 className="text-xl font-semibold leading-8 text-card-foreground">
                  {plan.name}
                </h3>
              </div>
              <div className="mt-2 p-4 rounded-md bg-primary/5 text-center">
                <p className="text-3xl font-bold text-primary">
                  ${(plan.price / 100).toFixed(2)}
                  {offerActive && plan.originalPrice > plan.price && (
                    <span className="ml-2 text-lg line-through text-muted-foreground">
                      ${(plan.originalPrice / 100).toFixed(2)}
                    </span>
                  )}
                </p>
                {offerActive && plan.originalPrice > plan.price && (
                  <p className="text-lg font-semibold text-foreground mt-2">
                    Save {config.fomoDiscountPercentage}%
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  {offerActive ? (
                    <span>
                      ${(plan.originalPrice / 100 / plan.minutes).toFixed(2)}{" "}
                      per minute
                    </span>
                  ) : (
                    <span>
                      ${(plan.price / 100 / plan.minutes).toFixed(2)} per minute
                    </span>
                  )}
                </p>
              </div>
              <p className="mt-2 flex-grow text-sm leading-6 text-muted-foreground text-center">
                {plan.description}
              </p>
              <PricingPlanButton
                recommended={plan.recommended}
                priceId={plan.priceId}
              />
            </div>
          ))}
        </div>

        <div className="mt-24 bg-card rounded-lg shadow-xl overflow-hidden">
          <PricingPageFaq />
        </div>

        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Take the Next Step to Interview Success
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Don&apos;t wait! With these limited-time savings, now is the perfect
            time to invest in your interview success. Choose a plan that works
            for you and start optimizing your performance today!
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="#"
              className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Get Started Now!
            </a>
            <a
              href="#"
              className="text-sm font-semibold leading-6 text-foreground"
            >
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
