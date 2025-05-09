"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { PricingTier } from "@/lib/landing/recruitment/types";
import { motion } from "framer-motion";
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay: i * 0.1,
      },
    }),
    hover: {
      y: -10,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.2 + i * 0.05,
      },
    }),
  };

  return (
    <SectionWrapper id="pricing">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionTitle>Pricing Plans</SectionTitle>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {pricingTiers.map((tier, index) => (
          <motion.div key={tier.name} custom={index} variants={cardVariants} whileHover="hover">
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {tier.features.map((feature, featureIndex) => (
                    <motion.li
                      key={feature}
                      className="flex items-start gap-2"
                      custom={featureIndex}
                      variants={featureVariants}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.3 + index * 0.1 + featureIndex * 0.05,
                          type: "spring",
                        }}
                      >
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      </motion.div>
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full relative overflow-hidden group" asChild>
                  <Link href={tier.cta.href}>
                    <motion.span
                      className="absolute inset-0 bg-primary/10"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    {tier.cta.label}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-muted-foreground">
          Need a custom plan?{" "}
          <Link href="#contact-form" className="text-primary hover:underline">
            Contact our sales team
          </Link>{" "}
          for tailored solutions.
        </p>
      </motion.div>
    </SectionWrapper>
  );
}
