import { checkRateLimit, getRateLimitCategory } from "@/lib/rate-limit";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/account(.*)"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);
const isPublicApiRoute = createRouteMatcher([
  "/api/og",
  "/api/webhooks/auth",
  "/api/webhooks/stripe",
  "/api/webhooks/emails",
  "/api/stripe/create-customer",
  "/api/changelogs",
  "/api/feature-requests",
  "/api/public/(.*)",
]);

const isExcludedFromRateLimit = createRouteMatcher(["/api/health", "/api/ping", "/api/status"]);

async function rateLimitMiddleware(request: NextRequest) {
  if (!isApiRoute(request) || isExcludedFromRateLimit(request)) {
    return null;
  }

  const category = getRateLimitCategory(request.nextUrl.pathname);
  const { success, limit, remaining, reset } = await checkRateLimit(request, category);

  if (!success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "You have exceeded the rate limit. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": new Date(reset * 1000).toISOString(),
          "Retry-After": Math.max(0, reset - Math.floor(Date.now() / 1000)).toString(),
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", new Date(reset * 1000).toISOString());

  return response;
}

export default clerkMiddleware(async (auth, req) => {
  // Apply rate limiting
  const rateLimitResponse = await rateLimitMiddleware(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  if (isApiRoute(req)) {
    if (!isPublicApiRoute(req)) {
      await auth.protect();
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
