"use client";

import { usePathname } from "next/navigation";
import { BlackFridayBanner } from "./black-friday-banner";

const EXCLUDED_PATHS = [
  "/checkout/black-friday",
];

export function ConditionalBlackFridayBanner() {
  const pathname = usePathname();

  // Check if the current path is the specific interview route
  const isInterviewRoute = /^\/dashboard\/interviews\/[^\/]+$/.test(pathname);

  // Check if the current path should be excluded
  const shouldShowBanner = !EXCLUDED_PATHS.includes(pathname) && !isInterviewRoute;

  if (!shouldShowBanner) {
    return null;
  }

  return <BlackFridayBanner />;
}
