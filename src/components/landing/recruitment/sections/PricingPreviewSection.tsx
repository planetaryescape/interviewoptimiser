import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { PricingTier } from "@/lib/landing/recruitment/types";
import { Check } from "lucide-react";
import Link from "next/link";
import SectionTitle from "../ui/SectionTitle";
import SectionWrapper from "../ui/SectionWrapper";

export default function PricingPreviewSection() {
  const pricingTiers: PricingTier[] = [
    {
      name: "Growth Tier",
      features: [
        "Up to 50 interviews/month",
        "Standard reporting",
        "Email support",
        "Basic ATS integration",
      ],
      cta: {
        label: "Contact Sales",
        href: "#contact-form",
      },
    },
    {
      name: "Scale Tier",
      features: [
        "Up to 200 interviews/month",
        "Advanced analytics",
        "Priority support",
        "Full ATS integration",
        "Custom question sets",
      ],
      cta: {
        label: "Request Custom Quote",
        href: "#contact-form",
      },
    },
    {
      name: "Enterprise Suite",
      features: [
        "Unlimited interviews",
        "Enterprise reporting",
        "Dedicated account manager",
        "Advanced integrations",
        "Custom deployment options",
        "On-premise options available",
      ],
      cta: {
        label: "Book Enterprise Demo",
        href: "#contact-form",
      },
    },
  ];

  return (
    <SectionWrapper id="pricing">
      <SectionTitle>Pricing Plans</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {pricingTiers.map((tier) => (
          <Card key={tier.name} className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-xl">{tier.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href={tier.cta.href}>{tier.cta.label}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground">
          Need a custom plan?{" "}
          <Link href="#contact-form" className="text-primary hover:underline">
            Contact our sales team
          </Link>{" "}
          for tailored solutions.
        </p>
      </div>
    </SectionWrapper>
  );
}
