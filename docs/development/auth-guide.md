# Authentication Refactoring Guide

This guide documents the pattern for refactoring API routes from the duplicated authentication pattern to use the new `withAuth` middleware.

## Problem

Currently, 37 API route files duplicate this authentication pattern:

```typescript
const { userId: clerkUserId } = getAuth(request);
if (!clerkUserId) {
  return NextResponse.json(formatErrorEntity("Unauthorized"), { status: 401 });
}

const { id: userId } = await getUserFromClerkId(clerkUserId);
if (!userId) {
  return NextResponse.json(formatErrorEntity("User not found"), { status: 404 });
}
```

## Solution

Created `src/lib/auth-middleware.ts` with `withAuth` higher-order function that:
- Handles Clerk authentication
- Fetches user from database
- Provides typed context with user data
- Centralizes error handling

## Refactoring Pattern

### 1. Simple Route (No Parameters)

**Before:**
```typescript
import { getUserFromClerkId } from "@/lib/auth";
import { getAuth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    return NextResponse.json(formatErrorEntity("Unauthorized"), { status: 401 });
  }

  try {
    const { id: userId } = await getUserFromClerkId(clerkUserId);
    if (!userId) {
      return NextResponse.json(formatErrorEntity("User not found"), { status: 404 });
    }

    // Route logic using userId
  } catch (error) {
    // Error handling
  }
}
```

**After:**
```typescript
import { withAuth } from "@/lib/auth-middleware";
import { NextResponse } from "next/server";

export const GET = withAuth(
  async (request, { user }) => {
    try {
      // Route logic using user.id instead of userId
    } catch (error) {
      // Error handling
    }
  },
  { routeName: "GET /api/your-route" }
);
```

### 2. Route with Parameters (Next.js 15 Style)

**Before:**
```typescript
export async function GET(
  request: NextRequest, 
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { userId: clerkUserId } = getAuth(request);
  // ... auth checks ...
  
  const itemId = params.id;
  // ... route logic
}
```

**After:**
```typescript
export const GET = withAuth<{ id: string }>(
  async (request, { user, params }) => {
    try {
      const itemId = params!.id;
      // ... route logic using user.id
    } catch (error) {
      // Error handling
    }
  },
  { routeName: "GET /api/items/[id]" }
);
```

### 3. Route Using auth() Instead of getAuth()

**Before:**
```typescript
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const authResult = await auth();
  const clerkUserId = authResult.userId;
  // ... rest of auth pattern
}
```

**After:**
```typescript
export async function GET(request: Request) {
  return withAuthAsync(
    async (request, { user }) => {
      try {
        // Route logic using user.id
      } catch (error) {
        // Error handling
      }
    },
    request,
    undefined,
    { routeName: "GET /api/your-route" }
  );
}
```

## Key Changes

1. **Import Changes:**
   - Remove: `getUserFromClerkId`, `getAuth`/`auth`
   - Add: `withAuth` or `withAuthAsync`
   - Change: `NextRequest` → `Request` (if needed)

2. **Function Signature:**
   - Change from `export async function` to `export const`
   - Use `withAuth` wrapper

3. **Variable Replacements:**
   - `userId` → `user.id`
   - `params.paramName` → `params!.paramName`

4. **Error Handling:**
   - Auth errors are handled by middleware
   - Keep try-catch for business logic errors

## Files Refactored

✅ Completed:
- `/api/reports/[id]/route.ts`
- `/api/jobs/[jobId]/reports/route.ts`
- `/api/dashboard/summary/route.ts`
- `/api/jobs/route.ts`

⏳ Remaining (33 files):
- All other API routes using getAuth() pattern

## Benefits

1. **DRY Principle:** Eliminates 52 instances of duplicated code
2. **Consistency:** Standardized auth handling across all routes
3. **Type Safety:** Typed AuthContext with user data
4. **Maintainability:** Single place to update auth logic
5. **Error Handling:** Centralized auth error responses