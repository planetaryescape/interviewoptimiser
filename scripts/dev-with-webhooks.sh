#!/bin/bash

# Development script that starts both Next.js and ngrok with synchronized ports
# This ensures webhooks work properly in local development

NGROK_URL="forcibly-settling-firefly.ngrok-free.app"
START_PORT=3000
MAX_PORT=3010

# Function to check if port is in use
check_port() {
    local port=$1
    lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1
    return $?
}

# Find available port
PORT=$START_PORT
while [ $PORT -le $MAX_PORT ]; do
    if ! check_port $PORT; then
        echo "✅ Port $PORT is available"
        break
    else
        echo "⚠️  Port $PORT is in use, trying next..."
        PORT=$((PORT + 1))
    fi
done

if [ $PORT -gt $MAX_PORT ]; then
    echo "❌ No available ports found between $START_PORT and $MAX_PORT"
    exit 1
fi

echo ""
echo "🚀 Starting development environment on port $PORT..."
echo "🌐 Public URL: https://$NGROK_URL"
echo ""
echo "📝 Webhook Endpoints:"
echo "   Clerk:  https://$NGROK_URL/api/webhooks/auth"
echo "   Stripe: https://$NGROK_URL/api/webhooks/stripe"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start both ngrok and Next.js with the same port
concurrently --names "NGROK,NEXT" --prefix-colors "magenta,cyan" \
  "ngrok http --url=$NGROK_URL $PORT" \
  "doppler run -- next dev --turbopack -p $PORT | bunx pino-pretty"
