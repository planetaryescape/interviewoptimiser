import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, CreditCard } from "lucide-react";
import Link from "next/link";

const features = [
  "Adaptive AI interview simulation",
  "Real-time voice interaction",
  "Detailed performance feedback",
  "Customised industry questions",
  "Interview recording & transcript",
  "Skills assessment report",
];

export function PricingPreviewSection() {
  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <CreditCard className="w-3 h-3 mr-1" />
            Simple Pricing
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight mb-4">Pay Only for What You Use</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            No subscriptions. No monthly fees. Choose the interview duration that works for you and
            pay once.
          </p>
        </div>

        <Card className="max-w-3xl mx-auto overflow-hidden shadow-xl">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Flexible Interview Packages</h3>
              <p className="text-muted-foreground">
                Choose from 15, 30, or 60-minute AI interview sessions
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div key={`feature-${index + 1}`} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm md:text-base">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/pricing">View All Plans & Pricing</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/auth/sign-up">Get Started Free</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            All packages include every feature. Pay once, practice as many times as you need.
          </p>
        </div>
      </div>
    </section>
  );
}
