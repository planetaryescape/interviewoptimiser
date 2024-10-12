// app/PostHogPageView.tsx
"use client";

import { useUser } from "@/hooks/useUser";
import { useAuth } from "@clerk/nextjs";
import { usePathname, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

export default function PostHogPageView(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();
  const { isSignedIn } = useAuth();
  const { data: user } = useUser();

  useEffect(() => {
    // Track pageviews
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture("$pageview", {
        $current_url: url,
      });
    }
  }, [pathname, searchParams, posthog]);

  useEffect(() => {
    if (isSignedIn && user && !posthog._isIdentified()) {
      posthog.identify(user.id.toString(), {
        email: user.email,
        name: user.firstname + " " + user.lastname,
        username: user.username,
      });
    }
    if (!isSignedIn && posthog._isIdentified()) {
      posthog.reset();
    }
  }, [user, posthog, isSignedIn]);

  return null;
}
