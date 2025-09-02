"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    description: "Perfect for getting started with AI interview practice",
    price: 9,
    originalPrice: 19,
    discount: "50% OFF",
    interval: "month",
    features: [
      "5 AI voice interviews per month",
      "Basic prosody analysis",
      "Instant feedback reports",
      "Common interview questions",
      "Email support",
    ],
    cta: "Start Free Trial",
    href: "/auth/sign-up",
    popular: false,
  },
  {
    name: "Professional",
    description: "Comprehensive practice for serious job seekers",
    price: 29,
    originalPrice: 59,
    discount: "50% OFF",
    interval: "month",
    features: [
      "Unlimited AI voice interviews",
      "Advanced prosody & emotion analysis",
      "Detailed performance reports",
      "Industry-specific questions",
      "Resume optimization tools",
      "Interview recording & playback",
      "Priority email support",
    ],
    cta: "Start Free Trial",
    href: "/auth/sign-up",
    popular: true,
  },
  {
    name: "Teams",
    description: "Perfect for recruiters and educational institutions",
    price: "Custom",
    originalPrice: null,
    discount: null,
    interval: null,
    features: [
      "Everything in Professional",
      "Team management dashboard",
      "Candidate tracking & comparison",
      "Custom interview templates",
      "ATS integration",
      "Analytics & reporting",
      "Dedicated account manager",
      "SLA & priority support",
    ],
    cta: "Contact Sales",
    href: "/contact-sales",
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Limited Time Offer
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Choose Your Path to Interview Success
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of job seekers who landed their dream jobs with our AI interview coach
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "relative overflow-hidden transition-all hover:shadow-2xl",
                plan.popular && "border-primary shadow-xl scale-105"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="mb-6">
                  {plan.originalPrice ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-sm text-muted-foreground">/{plan.interval}</span>
                      <span className="text-lg line-through text-muted-foreground ml-2">
                        ${plan.originalPrice}
                      </span>
                      {plan.discount && (
                        <Badge variant="destructive" className="ml-2">
                          {plan.discount}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="text-4xl font-bold">{plan.price}</div>
                  )}
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  asChild
                  className="w-full"
                  size="lg"
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            All plans include a 7-day free trial. No credit card required.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Cancel anytime. View our{" "}
            <Link href="/refund-policy" className="underline hover:text-foreground">
              refund policy
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
