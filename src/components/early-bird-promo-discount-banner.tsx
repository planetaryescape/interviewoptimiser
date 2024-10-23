"use client";

import { config } from "@/lib/config";
import { useEffect, useState } from "react";

export default function EarlyBirdPromoDiscountBanner() {
  const durationInMilliseconds =
    config.fomoDiscountPromoLengthInDays * 24 * 60 * 60 * 1000;
  const [timeLeft, setTimeLeft] = useState(durationInMilliseconds);
  const [offerActive, setOfferActive] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const elapsed =
        now.getTime() - config.fomoDiscountPromoStartDate.getTime();

      if (elapsed < 0) {
        // Offer hasn't started yet
        setOfferActive(false);
        setTimeLeft(durationInMilliseconds);
        clearInterval(timer);
      } else if (elapsed > durationInMilliseconds) {
        // Offer has ended
        setOfferActive(false);
        setTimeLeft(0);
        clearInterval(timer);
      } else {
        // Offer is active
        setOfferActive(true);
        setTimeLeft(durationInMilliseconds - elapsed);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [durationInMilliseconds]);

  const formatTime = (time: number) => {
    const days = Math.floor(time / (24 * 60 * 60 * 1000));
    const hours = Math.floor((time % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((time % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((time % (60 * 1000)) / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  if (!offerActive) {
    return null;
  }

  return (
    <div className="bg-primary/80 rounded-lg shadow-sm p-4 mb-12 text-center">
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Limited-Time Offer: 20% Off!
      </h3>
      <p className="text-sm text-foreground mb-2">
        Don&apos;t miss out on these savings. Offer expires in:
      </p>
      <p className="text-2xl font-bold text-foreground">
        {formatTime(timeLeft)}
      </p>
    </div>
  );
}
