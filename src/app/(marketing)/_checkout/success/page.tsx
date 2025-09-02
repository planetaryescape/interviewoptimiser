"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CheckoutSuccess() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-up");
    }
    queryClient.invalidateQueries({ queryKey: ["user"] });
  }, [isLoaded, isSignedIn, router, queryClient]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-block mb-6"
        >
          <CheckCircle2 className="h-20 w-20 text-green-500" />
        </motion.div>

        <Card className="p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">Thank You for Your Purchase! 🎉</h1>

            <p className="text-muted-foreground text-lg">
              Your 500 minutes have been added to your account. You&apos;re now ready to start
              practicing and improving your interview skills.
            </p>

            <div className="flex flex-col gap-4 pt-4">
              <Link href="/dashboard/create" className="block">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 transition-opacity gap-2"
                >
                  Start Your First Interview
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/dashboard" className="block">
                <Button variant="outline" size="lg" className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Need help getting started? Check out our{" "}
              <Link href="/dashboard/settings" className="text-primary hover:underline">
                settings
              </Link>{" "}
              to customize your experience or{" "}
              <Link href="/help" className="text-primary hover:underline">
                contact support
              </Link>{" "}
              if you have any questions.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
