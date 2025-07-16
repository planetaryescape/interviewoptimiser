# Webhook Security Implementation

## Overview

This application implements webhook signature verification for all incoming webhooks to ensure they are from legitimate sources. The implementation uses the Svix library for Clerk webhooks and follows industry-standard practices for webhook security.

## Clerk Webhook Security

### Configuration

To enable Clerk webhook signature verification, you need to configure the webhook secret in Doppler:

1. **Obtain the Webhook Secret from Clerk Dashboard**:
   - Navigate to your Clerk Dashboard
   - Go to "Webhooks" section
   - Find your webhook endpoint
   - Copy the "Signing Secret" (starts with `whsec_`)

2. **Configure in Doppler**:
   ```bash
   # Add to your Doppler environment
   CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

3. **Verify Configuration**:
   - The application will throw an error if the webhook secret is missing
   - Check logs for "Missing CLERK_WEBHOOK_SECRET" errors

### How Signature Verification Works

1. **Webhook Headers**: Clerk sends three important headers with each webhook:
   - `svix-id`: Unique identifier for the webhook message
   - `svix-timestamp`: Unix timestamp of when the webhook was sent
   - `svix-signature`: HMAC signature of the webhook payload

2. **Verification Process**:
   ```typescript
   // The webhook handler automatically verifies signatures
   const wh = new Webhook(CLERK_WEBHOOK_SECRET);
   const evt = wh.verify(body, {
     "svix-id": svixId,
     "svix-timestamp": svixTimestamp,
     "svix-signature": svixSignature,
   });
   ```

3. **Security Features**:
   - **Replay Protection**: Timestamps prevent replay attacks
   - **Payload Integrity**: Signatures ensure the payload hasn't been tampered with
   - **Authentication**: Only requests with valid signatures are processed

### Implementation Details

The webhook security is implemented in `/src/app/api/webhooks/auth/route.ts`:

```typescript
// Headers are extracted from the request
const svixId = request.headers.get("svix-id");
const svixTimestamp = request.headers.get("svix-timestamp");
const svixSignature = request.headers.get("svix-signature");

// All headers must be present
if (!svixId || !svixTimestamp || !svixSignature) {
  return new Response("Error occurred -- no svix headers", {
    status: 401,
  });
}

// Signature verification using Svix
try {
  const evt = wh.verify(body, {
    "svix-id": svixId,
    "svix-timestamp": svixTimestamp,
    "svix-signature": svixSignature,
  });
  // Process verified webhook...
} catch (err) {
  return new Response("Verification error", { status: 401 });
}
```

### Error Handling

When webhook verification fails, the application returns a `401 Unauthorized` response:

1. **Missing Headers**: Returns "Error occurred -- no svix headers"
2. **Invalid Signature**: Returns "Verification error"
3. **Expired Timestamp**: Automatically handled by Svix (default 5-minute window)

## Security Best Practices

### 1. Never Log Webhook Secrets
- The webhook secret should never be logged or exposed in error messages
- Use environment variables and secret management tools (Doppler)

### 2. Verify Early
- Signature verification should be the first step in webhook processing
- Don't parse or process the payload before verification

### 3. Use HTTPS
- Always use HTTPS endpoints for webhooks
- This prevents man-in-the-middle attacks

### 4. Idempotency
- Design webhook handlers to be idempotent
- Use the `svix-id` to prevent duplicate processing

### 5. Timeout Handling
- Webhook handlers should respond quickly (< 30 seconds)
- Use background jobs for long-running processes

## Troubleshooting

### Common Issues

1. **"Missing CLERK_WEBHOOK_SECRET" Error**
   - Ensure the environment variable is set in Doppler
   - Restart the application after updating environment variables

2. **401 Unauthorized Responses**
   - Verify the webhook secret matches exactly (including `whsec_` prefix)
   - Check that all three svix headers are present in the request
   - Ensure the webhook URL in Clerk matches your application

3. **Signature Verification Failures**
   - Confirm you're using the raw request body (not parsed JSON)
   - Check for any proxy or middleware that might modify the request
   - Verify timestamps are within the 5-minute window

### Testing Webhooks Locally

For local development, use a webhook tunneling service:

1. **Using ngrok**:
   ```bash
   ngrok http 3000
   ```

2. **Configure Clerk**:
   - Update webhook URL to your ngrok URL
   - Example: `https://abc123.ngrok.io/api/webhooks/auth`

3. **Test Events**:
   - Use Clerk's webhook testing tools
   - Monitor logs for verification success/failure

## Monitoring and Alerts

1. **Log Failed Verifications**:
   - Track 401 responses in your monitoring system
   - Alert on unusual patterns (potential attacks)

2. **Monitor Webhook Latency**:
   - Track processing time for webhook handlers
   - Set up alerts for slow responses

3. **Track Webhook Events**:
   - Log successful webhook processing
   - Monitor for missing expected webhooks

## Additional Webhook Endpoints

While this document focuses on Clerk webhooks, similar security principles apply to other webhook endpoints:

- **Stripe Webhooks**: Use Stripe's signature verification
- **Email Service Webhooks**: Implement provider-specific verification
- **Custom Webhooks**: Implement HMAC-based signature verification

Each provider typically has their own signature verification method, but the general principles remain the same: verify signatures, check timestamps, and handle errors appropriately.