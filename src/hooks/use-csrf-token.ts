"use client";

import { useCallback, useEffect, useState } from "react";

const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";

export function useCSRFToken() {
  const [csrfToken, setCSRFToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getCookieValue = useCallback((name: string): string | null => {
    if (typeof document === "undefined") return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() || null;
    }
    return null;
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch("/api/csrf-token", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const token = getCookieValue(CSRF_COOKIE_NAME);
        setCSRFToken(token);
      }
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getCookieValue]);

  useEffect(() => {
    const token = getCookieValue(CSRF_COOKIE_NAME);
    if (token) {
      setCSRFToken(token);
      setIsLoading(false);
    } else {
      refreshToken();
    }
  }, [refreshToken, getCookieValue]);

  const getHeaders = useCallback((): HeadersInit => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (csrfToken) {
      headers[CSRF_HEADER_NAME] = csrfToken;
    }

    return headers;
  }, [csrfToken]);

  const secureFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const method = options.method?.toUpperCase() || "GET";
      const needsCSRF = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

      if (needsCSRF && !csrfToken) {
        await refreshToken();
      }

      const headers = {
        ...getHeaders(),
        ...(options.headers || {}),
      };

      return fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });
    },
    [csrfToken, getHeaders, refreshToken]
  );

  return {
    csrfToken,
    isLoading,
    refreshToken,
    getHeaders,
    secureFetch,
  };
}
