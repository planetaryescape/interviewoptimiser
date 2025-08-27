"use client";

import { type ReactNode, useEffect } from "react";

interface CSRFProviderProps {
  children: ReactNode;
}

export function CSRFProvider({ children }: CSRFProviderProps) {
  useEffect(() => {
    // Initialize CSRF token on mount
    const initCSRF = async () => {
      try {
        await fetch("/api/csrf-token", {
          method: "GET",
          credentials: "include",
        });
      } catch (_error) {
        // CSRF token initialization failed silently
      }
    };

    initCSRF();
  }, []);

  return <>{children}</>;
}
