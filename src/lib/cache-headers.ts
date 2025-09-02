import type { NextResponse } from "next/server";

export type CacheControlOptions = {
  maxAge?: number;
  sMaxAge?: number;
  staleWhileRevalidate?: number;
  staleIfError?: number;
  private?: boolean;
  public?: boolean;
  noCache?: boolean;
  noStore?: boolean;
  mustRevalidate?: boolean;
  immutable?: boolean;
};

export function generateCacheControlHeader(options: CacheControlOptions): string {
  const directives: string[] = [];

  if (options.private) directives.push("private");
  if (options.public) directives.push("public");
  if (options.noCache) directives.push("no-cache");
  if (options.noStore) directives.push("no-store");
  if (options.mustRevalidate) directives.push("must-revalidate");
  if (options.immutable) directives.push("immutable");

  if (options.maxAge !== undefined) {
    directives.push(`max-age=${options.maxAge}`);
  }

  if (options.sMaxAge !== undefined) {
    directives.push(`s-maxage=${options.sMaxAge}`);
  }

  if (options.staleWhileRevalidate !== undefined) {
    directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
  }

  if (options.staleIfError !== undefined) {
    directives.push(`stale-if-error=${options.staleIfError}`);
  }

  return directives.join(", ");
}

export function setCacheHeaders(
  response: NextResponse,
  options: CacheControlOptions
): NextResponse {
  const cacheControl = generateCacheControlHeader(options);
  if (cacheControl) {
    response.headers.set("Cache-Control", cacheControl);
  }
  return response;
}

export const CacheProfiles = {
  STATIC: {
    public: true,
    maxAge: 31536000,
    immutable: true,
  },

  PUBLIC_DATA: {
    public: true,
    sMaxAge: 300,
    staleWhileRevalidate: 600,
    staleIfError: 86400,
  },

  USER_DATA: {
    private: true,
    maxAge: 0,
    sMaxAge: 60,
    staleWhileRevalidate: 120,
  },

  DYNAMIC: {
    private: true,
    noCache: true,
    noStore: true,
  },

  LOOKUP_DATA: {
    public: true,
    sMaxAge: 86400,
    staleWhileRevalidate: 604800,
  },

  REPORT_DATA: {
    private: true,
    maxAge: 300,
    sMaxAge: 600,
    staleWhileRevalidate: 1800,
  },
} as const;
