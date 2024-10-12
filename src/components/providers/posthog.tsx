// app/providers.js
"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
    // api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "",
    person_profiles: "always",
    capture_pageleave: true,
    capture_pageview: false,
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
  });
}
export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
