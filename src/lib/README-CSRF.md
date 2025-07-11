# CSRF Protection Quick Start

## For Developers

### Making API Calls

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

### In React Components

Use the `useCSRFToken` hook:

```typescript
import { useCSRFToken } from "@/hooks/use-csrf-token";

function MyComponent() {
  const { secureFetch } = useCSRFToken();
  
  const handleSubmit = async (data) => {
    const response = await secureFetch("/api/endpoint", {
      method: "POST",
      body: JSON.stringify(data),
    });
  };
}
```

### Configuration

Add to your `.env.local`:
```bash
CSRF_SECRET=your-random-secret-key-here
```

## What's Protected

- ✅ All POST, PUT, PATCH, DELETE requests to `/api/*`
- ❌ GET, HEAD, OPTIONS requests (safe methods)
- ❌ Webhook endpoints (`/api/webhooks/*`)
- ❌ Public APIs (`/api/public/*`)

## Troubleshooting

**Getting 403 Forbidden?**
- Check browser console for CSRF token
- Ensure cookies are enabled
- Try refreshing the page

**Token expired?**
- Tokens last 24 hours
- Refresh the page to get a new one

## Need Help?

See full documentation: `/docs/security/csrf-protection.md`