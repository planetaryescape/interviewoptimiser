import { getUserFromClerkId } from "@/lib/auth";
import { formatErrorEntity } from "@/lib/utils/formatEntity";
import { getAuth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { logger } from "~/lib/logger";

export type AuthContext = {
  user: {
    id: number;
    minutes?: number;
    role?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    stripeCustomerId?: string;
  };
  clerkUserId: string;
};

export type AuthenticatedHandler<TParams = Record<string, unknown>> = (
  request: NextRequest,
  context: AuthContext & { params?: TParams }
) => Promise<Response>;

/**
 * Higher-order function that wraps API route handlers with authentication.
 * Automatically handles Clerk authentication and user lookup.
 *
 * @param handler - The authenticated route handler function
 * @param routeName - Optional route name for logging
 * @returns Wrapped handler that includes authentication
 *
 * @example
 * export const GET = withAuth(async (request, { user, clerkUserId }) => {
 *   // Your route logic here
 *   return NextResponse.json({ userId: user.id });
 * });
 *
 * @example With params (Next.js 15 style)
 * export const GET = withAuth(
 *   async (request, { user, params }) => {
 *     const { id } = params;
 *     // Your route logic
 *   },
 *   { routeName: 'getReport' }
 * );
 */
const CLERK_USER_ID_MIN_LENGTH = 10;
const CLERK_USER_ID_PATTERN = /^(user_|usr_)[a-zA-Z0-9_-]+$/;

function isValidClerkUserId(clerkUserId: unknown): clerkUserId is string {
  if (!clerkUserId || typeof clerkUserId !== "string") {
    return false;
  }

  if (clerkUserId.length < CLERK_USER_ID_MIN_LENGTH) {
    return false;
  }

  return CLERK_USER_ID_PATTERN.test(clerkUserId);
}

function checkRateLimit(request: NextRequest, routeName: string): NextResponse | null {
  const rateLimitExceeded = request.headers.get("X-RateLimit-Remaining") === "0";
  if (rateLimitExceeded) {
    logger.warn(`Rate limit exceeded for ${routeName}`);
    return NextResponse.json(formatErrorEntity("Rate limit exceeded"), {
      status: 429,
    });
  }
  return null;
}

export function withAuth<TParams = Record<string, unknown>>(
  handler: AuthenticatedHandler<TParams>,
  options?: {
    routeName?: string;
  }
): {
  (request: NextRequest): Promise<Response>;
  (request: NextRequest, routeSegment: { params: Promise<TParams> }): Promise<Response>;
} {
  return async (request: NextRequest, routeSegment?: { params: Promise<TParams> }) => {
    const routeName = options?.routeName || request.nextUrl.pathname;

    // Check for rate limiting first
    const rateLimitResponse = checkRateLimit(request, routeName);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Get Clerk user ID
    const { userId: clerkUserId } = getAuth(request);
    if (!isValidClerkUserId(clerkUserId)) {
      logger.warn(
        {
          clerkUserId: typeof clerkUserId === "string" ? clerkUserId : typeof clerkUserId,
          routeName,
        },
        "Invalid or missing Clerk user ID"
      );
      return NextResponse.json(formatErrorEntity("Unauthorized"), {
        status: 401,
      });
    }

    try {
      // Get user from database with caching
      const userData = await getUserFromClerkId(clerkUserId, {
        useCache: true,
        ttl: 300,
      });
      if (!userData.id) {
        logger.warn({ clerkUserId }, `User not found in database for ${routeName}`);
        return NextResponse.json(formatErrorEntity("Unauthorized"), {
          status: 403,
        });
      }

      // Prepare context with resolved params if they exist
      const context: AuthContext & { params?: TParams } = {
        user: {
          id: userData.id,
          minutes: userData.minutes,
          role: userData.role,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          stripeCustomerId: userData.stripeCustomerId,
        },
        clerkUserId,
      };

      // Handle Next.js 15 async params
      if (routeSegment?.params) {
        const params = await routeSegment.params;
        context.params = params;
      }

      // Call the actual handler
      return handler(request, context);
    } catch (error) {
      logger.error({ error, routeName }, "Error in authenticated route handler");
      return NextResponse.json(formatErrorEntity("An unexpected error occurred"), { status: 500 });
    }
  };
}

/**
 * Alternative middleware for routes that use auth() instead of getAuth()
 * This is for consistency with routes that might already use the auth() pattern
 */
export async function withAuthAsync<TParams = Record<string, unknown>>(
  handler: AuthenticatedHandler<TParams>,
  request: NextRequest,
  routeSegment?: { params: Promise<TParams> },
  options?: {
    routeName?: string;
  }
): Promise<Response> {
  const { auth } = await import("@clerk/nextjs/server");
  const routeName = options?.routeName || request.nextUrl.pathname;

  // Check for rate limiting first
  const rateLimitResponse = checkRateLimit(request, routeName);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const authResult = await auth();
  const clerkUserId = authResult?.userId;

  if (!isValidClerkUserId(clerkUserId)) {
    logger.warn(
      {
        clerkUserId: typeof clerkUserId === "string" ? clerkUserId : typeof clerkUserId,
        routeName,
      },
      "Invalid or missing Clerk user ID"
    );
    return NextResponse.json(formatErrorEntity("Unauthorized"), {
      status: 401,
    });
  }

  try {
    const userData = await getUserFromClerkId(clerkUserId, {
      useCache: true,
      ttl: 300,
    });
    if (!userData.id) {
      logger.warn({ clerkUserId }, `User not found in database for ${routeName}`);
      return NextResponse.json(formatErrorEntity("Unauthorized"), {
        status: 403,
      });
    }

    const context: AuthContext & { params?: TParams } = {
      user: {
        id: userData.id,
        minutes: userData.minutes,
        role: userData.role,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        stripeCustomerId: userData.stripeCustomerId,
      },
      clerkUserId,
    };

    if (routeSegment?.params) {
      const params = await routeSegment.params;
      context.params = params;
    }

    return handler(request, context);
  } catch (error) {
    logger.error({ error, routeName }, "Error in authenticated route handler");
    return NextResponse.json(formatErrorEntity("An unexpected error occurred"), { status: 500 });
  }
}
