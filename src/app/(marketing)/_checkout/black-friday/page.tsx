"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function BlackFridayCheckout() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-up?redirect=/checkout/black-friday");
    }
  }, [isLoaded, isSignedIn, router]);

  const createCheckoutSession = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/create-black-friday-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        router.push(data.url);
      } else {
        toast.error("Error creating checkout session");
      }
    },
    onError: (error) => {
      toast.error("Failed to create checkout session. Please try again.");
      console.error("Checkout error:", error);
    },
  });

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-center mb-8">
          🔥 Black Friday Special Offer
        </h1>

        <Card className="p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              500 Minutes Package - Limited Time Offer
            </h2>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">$60</span>
              <span className="text-muted-foreground line-through">$100</span>
              <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 px-2 py-1 rounded-full text-sm font-medium">
                Save 40%
              </span>
            </div>

            <ul className="space-y-2 list-disc list-inside text-muted-foreground">
              <li>500 minutes of interview practice</li>
              <li>Detailed feedback and analysis</li>
              <li>Access to premium question bank</li>
              <li>Performance tracking and insights</li>
              <li>Valid for 12 months</li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium">Total</span>
              <span className="text-2xl font-bold">$60.00</span>
            </div>

            <Button
              onClick={() => createCheckoutSession.mutate()}
              disabled={createCheckoutSession.isPending}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 transition-opacity"
              size="lg"
            >
              {createCheckoutSession.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Secure Your Black Friday Deal"
              )}
            </Button>

            <p className="text-sm text-muted-foreground text-center mt-4">
              🕒 Offer ends December 2nd, 2024
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
