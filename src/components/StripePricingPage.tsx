import { stripe } from "@/lib/stripe";
import * as React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "stripe-pricing-table": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export async function StripePricingPage() {
  const products = await stripe.products.list({
    expand: ["data.default_price"],
  });

  return (
    <div>
      <pre>{JSON.stringify(products, null, 2)}</pre>
      <stripe-pricing-table
        pricing-table-id={process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID}
        publishable-key={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
      ></stripe-pricing-table>
    </div>
  );
}
