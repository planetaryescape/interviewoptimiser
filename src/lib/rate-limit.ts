import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import type { NextRequest } from "next/server";

type Duration = `${number}${"ms" | "s" | "m" | "h" | "d"}`;

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export interface RateLimitConfig {
  requests: number;
  window: Duration;
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  auth: { requests: 10, window: "15m" as Duration },
  webhook: { requests: 100, window: "1m" as Duration },
  api: { requests: 60, window: "1m" as Duration },
  publicApi: { requests: 30, window: "1m" as Duration },
  fileUpload: { requests: 10, window: "10m" as Duration },
  report: { requests: 20, window: "10m" as Duration },
  ai: { requests: 20, window: "10m" as Duration },
};

const createRatelimit = (config: RateLimitConfig) => {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    console.warn("Rate limiting disabled: KV_REST_API_URL and KV_REST_API_TOKEN not configured");
    return null;
  }

  return new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    prefix: "interview-optimiser",
  });
};

const rateLimiters = Object.entries(rateLimitConfigs).reduce(
  (acc, [key, config]) => {
    acc[key] = createRatelimit(config);
    return acc;
  },
  {} as Record<string, Ratelimit | null>
);

export function getRateLimiter(type: keyof typeof rateLimitConfigs) {
  return rateLimiters[type];
}

export function getIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  return cfConnectingIp || realIp || forwarded?.split(",")[0] || "127.0.0.1";
}

export async function checkRateLimit(
  request: NextRequest,
  type: keyof typeof rateLimitConfigs
): Promise<RateLimitResult> {
  const rateLimiter = getRateLimiter(type);

  if (!rateLimiter) {
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    };
  }

  const identifier = getIdentifier(request);
  const result = await rateLimiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

export function getRateLimitCategory(pathname: string): keyof typeof rateLimitConfigs {
  if (pathname.startsWith("/api/webhooks/auth")) return "auth";
  if (pathname.startsWith("/api/webhooks")) return "webhook";
  if (pathname.startsWith("/api/public")) return "publicApi";
  if (pathname.includes("/upload") || pathname.includes("/extract")) return "fileUpload";
  if (pathname.includes("/report") || pathname.includes("/analyze")) return "report";
  if (pathname.includes("/ai") || pathname.includes("/interview")) return "ai";

  return "api";
}
