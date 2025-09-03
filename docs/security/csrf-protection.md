# CSRF Protection Implementation

## Quick Start

### For Developers

Use `secureFetch` instead of regular `fetch`:

```typescript
// ❌ Old way
fetch("/api/jobs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

// ✅ New way
import { secureFetch } from "@/lib/utils/secure-fetch";

secureFetch("/api/jobs", {
  method: "POST",
  body: JSON.stringify(data),
});
```

### What&apos;s Protected

- ✅ All POST, PUT, PATCH, DELETE requests to `/api/*`
- ❌ GET, HEAD, OPTIONS requests (safe methods)
- ❌ Webhook endpoints (`/api/webhooks/*`)
- ❌ Public APIs (`/api/public/*`)

## Overview

This application implements Cross-Site Request Forgery (CSRF) protection to prevent unauthorized actions on behalf of authenticated users. The implementation uses a double-submit cookie pattern with signed tokens.

## How It Works

1. **Token Generation**: When a user visits the application, a CSRF token is generated and stored in a cookie
2. **Token Validation**: For state-changing requests (POST, PUT, PATCH, DELETE), the token must be included in both:
   - A cookie (automatically sent by the browser)
   - A custom header (`x-csrf-token`)
3. **Double Submit**: The server validates that both tokens match and are valid

## Implementation Details

### Server-Side Components

#### CSRF Utilities (`src/lib/csrf.ts`)
- `generateCSRFToken()`: Creates a signed token with timestamp
- `validateCSRFToken()`: Validates token signature and expiry
- `getCSRFToken()`: Extracts and validates token from request
- `setCSRFCookie()`: Sets the CSRF cookie with proper security settings

#### Middleware Integration (`src/middleware.ts`)
- Automatically validates CSRF tokens for protected routes
- Exempts webhook endpoints and public APIs
- Returns 403 Forbidden for invalid tokens

#### CSRF Token Endpoint (`src/app/api/csrf-token/route.ts`)
- GET endpoint to obtain a fresh CSRF token
- Automatically sets the token as a cookie

### Client-Side Components

#### Secure Fetch Utility (`src/lib/utils/secure-fetch.ts`)
```typescript
import { secureFetch } from "@/lib/utils/secure-fetch";

// Automatically includes CSRF token for state-changing requests
const response = await secureFetch("/api/jobs", {
  method: "POST",
  body: JSON.stringify(data),
});
```

#### React Hook (`src/hooks/use-csrf-token.ts`)
```typescript
import { useCSRFToken } from "@/hooks/use-csrf-token";

function MyComponent() {
  const { csrfToken, secureFetch, getHeaders } = useCSRFToken();
  
  const handleSubmit = async () => {
    const response = await secureFetch("/api/data", {
      method: "POST",
      body: JSON.stringify({ foo: "bar" }),
    });
  };
}
```

#### CSRF Provider (`src/components/csrf-provider.tsx`)
Initializes CSRF token on app mount. Add to your root layout:

```tsx
import { CSRFProvider } from "@/components/csrf-provider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CSRFProvider>
          {children}
        </CSRFProvider>
      </body>
    </html>
  );
}
```

## Usage Guidelines

### For API Routes

No changes needed! CSRF protection is automatically applied by the middleware.

### For Client-Side Requests

#### Using React Query
```typescript
import { secureFetch } from "@/lib/utils/secure-fetch";

const mutation = useMutation({
  mutationFn: async (data) => {
    const response = await secureFetch("/api/resource", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  },
});
```

#### Using the Hook
```typescript
import { useCSRFToken } from "@/hooks/use-csrf-token";

function MyForm() {
  const { secureFetch } = useCSRFToken();
  
  const onSubmit = async (data) => {
    const response = await secureFetch("/api/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  };
}
```

#### Manual Fetch (Not Recommended)
```typescript
// Get token from cookie
const csrfToken = document.cookie
  .split("; ")
  .find(row => row.startsWith("csrf-token="))
  ?.split("=")[1];

// Include in request
fetch("/api/data", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-csrf-token": csrfToken,
  },
  credentials: "include",
  body: JSON.stringify(data),
});
```

## Exempt Endpoints

The following endpoints are exempt from CSRF protection:
- `/api/webhooks/*` - External webhook endpoints
- `/api/og` - Open Graph image generation
- `/api/health`, `/api/ping`, `/api/status` - Health check endpoints
- `/api/csrf-token` - CSRF token endpoint itself

## Configuration

### Environment Variables

Add to your `.env` file:
```bash
CSRF_SECRET=your-random-secret-key-here
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### Token Settings
- **Expiry**: 24 hours
- **Cookie Settings**:
  - `httpOnly`: false (to allow JavaScript access)
  - `secure`: true (in production)
  - `sameSite`: strict
  - `path`: /

## Troubleshooting

### Common Issues

1. **403 Forbidden Errors**
   - Ensure the CSRF token is being included in the request header
   - Check that cookies are enabled in the browser
   - Verify the token hasn't expired (24-hour lifetime)

2. **Token Not Found**
   - Make sure `CSRFProvider` is included in your app
   - Check that the `/api/csrf-token` endpoint is accessible
   - Verify cookies are being set correctly

3. **Development vs Production**
   - In development, cookies use `secure: false`
   - In production, HTTPS is required for secure cookies

## Security Considerations

1. **Token Rotation**: Tokens are valid for 24 hours and should be refreshed regularly
2. **HTTPS Required**: In production, always use HTTPS to prevent token interception
3. **SameSite Cookies**: Set to "strict" to prevent CSRF via third-party sites
4. **Signed Tokens**: Tokens are signed with HMAC-SHA256 to prevent tampering

## Migration Guide

To migrate existing code:

1. Replace `fetch()` with `secureFetch()` for all API calls
2. Add `CSRFProvider` to your root layout
3. Update any custom fetch wrappers to use the CSRF utilities
4. Test all forms and API interactions

Example migration:
```typescript
// Before
fetch("/api/jobs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

// After
import { secureFetch } from "@/lib/utils/secure-fetch";

secureFetch("/api/jobs", {
  method: "POST",
  body: JSON.stringify(data),
});
```