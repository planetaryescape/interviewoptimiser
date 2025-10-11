# Development Scripts

This directory contains helper scripts for local development.

## Webhook Development with ngrok

### Prerequisites

1. **Install ngrok**: `brew install ngrok` (macOS) or download from [ngrok.com](https://ngrok.com)
2. **Configure ngrok**: Set up your ngrok authtoken
   ```bash
   ngrok config add-authtoken <your-token>
   ```
3. **Reserve ngrok domain**: The scripts use `forcibly-settling-firefly.ngrok-free.app` as the fixed URL

### Available Scripts

#### `bun run dev:webhooks`

Starts both the Next.js development server and ngrok tunnel simultaneously.

**What it does:**
- Finds an available port (3000-3010)
- Starts ngrok tunnel on that port with fixed URL
- Starts Next.js dev server on the same port
- Displays webhook endpoints for easy configuration

**Output:**
```
🚀 Starting development environment on port 3000...
🌐 Public URL: https://forcibly-settling-firefly.ngrok-free.app

📝 Webhook Endpoints:
   Clerk:  https://forcibly-settling-firefly.ngrok-free.app/api/webhooks/auth
   Stripe: https://forcibly-settling-firefly.ngrok-free.app/api/webhooks/stripe
```

**Usage:**
```bash
bun run dev:webhooks
```

#### `bun run ngrok`

Starts only the ngrok tunnel (for when you want to run Next.js separately).

**Usage:**
```bash
# Terminal 1: Start ngrok
bun run ngrok

# Terminal 2: Start dev server on the same port
bun run dev
```

### Configuring Webhooks

Once ngrok is running, configure your webhook endpoints:

#### Clerk Webhooks

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Webhooks** → **Add Endpoint**
3. Set endpoint URL: `https://forcibly-settling-firefly.ngrok-free.app/api/webhooks/auth`
4. Select events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
   - `session.created`
5. Copy the signing secret to Doppler as `CLERK_WEBHOOK_SECRET`

#### Stripe Webhooks

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks** → **Add Endpoint**
3. Set endpoint URL: `https://forcibly-settling-firefly.ngrok-free.app/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the signing secret to Doppler as `STRIPE_WEBHOOK_SECRET`

### Troubleshooting

**Port already in use:**
- The scripts automatically try ports 3000-3010
- If all ports are busy, kill existing processes or increase MAX_PORT in the scripts

**ngrok URL not working:**
- Ensure you've reserved the domain `forcibly-settling-firefly.ngrok-free.app` in ngrok dashboard
- Or update `NGROK_URL` in the scripts to use your own reserved domain

**Webhooks not being received:**
- Check ngrok is running and accessible
- Verify webhook endpoints are configured correctly in Clerk/Stripe
- Check webhook signing secrets are set in Doppler
- Monitor logs: `bun run dev:webhooks` shows both ngrok and Next.js logs

### Why Use This?

**Without ngrok:**
- Webhooks can't reach your local development server
- Must deploy to test webhook integrations
- Slow development cycle

**With ngrok:**
- Test webhooks locally
- See real-time webhook payloads
- Debug webhook handling immediately
- Fast iteration on webhook logic

### Security Notes

- The ngrok URL is **public** - anyone can access it
- Don't commit sensitive data or use production secrets
- Always verify webhook signatures (already implemented in the webhook handlers)
- Use Doppler to manage secrets, never commit them to git
