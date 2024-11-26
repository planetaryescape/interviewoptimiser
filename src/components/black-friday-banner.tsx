"use client";

import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

export function BlackFridayBanner() {
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    try {
      setIsUserSignedIn(isSignedIn || false);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsUserSignedIn(false);
    }
  }, [isSignedIn]);

  const targetUrl = isUserSignedIn ? "/checkout/black-friday" : "/sign-up?redirect=/checkout/black-friday";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white w-full"
    >
      <Link href={targetUrl} className="block w-full">
        <div className="container mx-auto px-4 py-3 flex items-center justify-center text-center">
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4"
          >
            <span className="font-bold text-lg">🔥 BLACK FRIDAY SPECIAL 🔥</span>
            <span className="font-semibold">
              Get 500 minutes for just $60! Limited time offer - Ends Dec 2nd, 2024
            </span>
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="bg-white text-purple-600 px-4 py-1 rounded-full font-bold whitespace-nowrap"
            >
              Claim Now →
            </motion.span>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
}
