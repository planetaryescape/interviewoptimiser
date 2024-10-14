import { PricingPlans } from "@/components/PricingPage";

export default function PricingPagePage() {
  return (
    <section id="pricing" className="h-full w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-4">
          Flexible Pay-as-you-go Pricing for Every Job Seeker
        </h2>
        <p className="text-center mb-8">
          Buy only the minutes you need, when you need them.
        </p>

        <PricingPlans />
      </div>
    </section>
  );
}
