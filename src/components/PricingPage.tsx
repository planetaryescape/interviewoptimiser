import { PricingCardFooter } from "@/components/PricingCardFooter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ClerkProvider } from "@clerk/nextjs";
import { Check } from "lucide-react";
import { Suspense } from "react";
import type Stripe from "stripe";
import { stripe } from "~/lib/stripe";

export async function PricingPlans() {
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

  if (sortedProducts.length === 0) {
    return <div className="text-center p-4">No pricing plans available.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl">
      {sortedProducts.map((product, index) => {
        const price = product.default_price as Stripe.Price;
        const priceAmount = (price?.unit_amount || 0) / 100;
        const isPopular = index === 1;

        return (
          <Card
            key={product.id || index}
            className={`${isPopular ? "border-2 border-primary" : ""}`}
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                {product.name || `Plan ${index + 1}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-5xl font-bold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: price.currency,
                  }).format(priceAmount)}
                </span>
                <span className="text-muted-foreground"> one-time</span>
              </div>
              {isPopular && (
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <ul className="mt-6 space-y-4">
                {product.marketing_features?.map((feature, _featureIndex) => (
                  <li key={feature.name} className="grid grid-cols-[30px_1fr] items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>{feature.name}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Suspense fallback={null}>
                <ClerkProvider dynamic>
                  <PricingCardFooter priceId={price.id} />
                </ClerkProvider>
              </Suspense>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
