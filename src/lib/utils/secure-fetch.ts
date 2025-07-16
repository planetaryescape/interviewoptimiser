import { QueryClient } from "@tanstack/react-query";

const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

export async function secureFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const method = options.method?.toUpperCase() || "GET";
  const needsCSRF = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  let csrfToken = getCookieValue(CSRF_COOKIE_NAME);

  // If we need CSRF and don't have a token, fetch one first
  if (needsCSRF && !csrfToken) {
    await fetch("/api/csrf-token", {
      method: "GET",
      credentials: "include",
    });
    csrfToken = getCookieValue(CSRF_COOKIE_NAME);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (csrfToken && needsCSRF) {
    headers[CSRF_HEADER_NAME] = csrfToken;
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
}

// Create a custom query client with our secure fetch as default
export function createSecureQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: async ({ queryKey }) => {
          const [url] = queryKey as [string];
          const response = await secureFetch(url);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        },
      },
      mutations: {
        mutationFn: async (variables: unknown) => {
          const {
            url,
            method = "POST",
            body,
          } = variables as {
            url: string;
            method?: string;
            body?: unknown;
          };
          const response = await secureFetch(url, {
            method,
            body: JSON.stringify(body),
          });
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        },
      },
    },
  });
}
