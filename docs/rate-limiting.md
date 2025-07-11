# Rate Limiting Configuration

## Overview

This application implements rate limiting using Vercel KV (Redis-compatible) and @upstash/ratelimit to protect API endpoints from abuse, DoS attacks, and excessive usage.

## Setup

### Environment Variables

To enable rate limiting, you need to configure the following environment variables:

```bash
KV_REST_API_URL=your_vercel_kv_url
KV_REST_API_TOKEN=your_vercel_kv_token
```

### Creating a Vercel KV Database

1. Go to your Vercel dashboard
2. Navigate to the "Storage" tab
3. Click "Create Database" and select "KV"
4. Copy the REST API URL and token from the database settings
5. Add them to your environment variables

Note: If these environment variables are not set, rate limiting will be disabled with a warning message in the console.

## Rate Limit Configuration

Different endpoints have different rate limits based on their purpose:

| Endpoint Type | Requests | Window | Description |
|--------------|----------|---------|-------------|
| Auth Webhooks | 10 | 15 minutes | Clerk authentication webhooks |
| General Webhooks | 100 | 1 minute | Stripe and email webhooks |
| API Routes | 60 | 1 minute | Authenticated API endpoints |
| Public API | 30 | 1 minute | Public API endpoints |
| File Upload | 10 | 10 minutes | File upload and extraction endpoints |
| Reports | 20 | 10 minutes | Report generation endpoints |
| AI Operations | 20 | 10 minutes | AI interview and analysis endpoints |

## How It Works

1. **Middleware Integration**: Rate limiting is integrated into the Next.js middleware
2. **IP Detection**: Uses various headers to detect the client IP (CF-Connecting-IP, X-Real-IP, X-Forwarded-For)
3. **Sliding Window**: Uses a sliding window algorithm for smooth rate limiting
4. **Response Headers**: Includes rate limit information in response headers:
   - `X-RateLimit-Limit`: Total requests allowed
   - `X-RateLimit-Remaining`: Remaining requests
   - `X-RateLimit-Reset`: When the limit resets
   - `Retry-After`: Seconds until retry (on 429 responses)

## Error Response

When rate limit is exceeded, the API returns:

```json
{
  "error": "Too many requests",
  "message": "You have exceeded the rate limit. Please try again later."
}
```

Status Code: `429 Too Many Requests`

## Monitoring

Rate limit hits can be monitored through:
- Vercel KV dashboard for Redis operations
- Application logs for rate limit violations
- Response headers for current usage

## Customization

To modify rate limits, edit the `rateLimitConfigs` object in `/src/lib/rate-limit.ts`:

```typescript
const rateLimitConfigs: Record<string, RateLimitConfig> = {
  auth: { requests: 10, window: "15m" },
  // Add or modify configurations here
};
```

## Testing

To test rate limiting:

1. Make repeated requests to an endpoint
2. Check response headers for rate limit information
3. Verify 429 response when limit is exceeded
4. Confirm retry works after the reset time