#!/bin/bash

# Start ngrok tunnel for webhook development
# This script starts ngrok with a fixed URL and finds an available port

NGROK_URL="forcibly-settling-firefly.ngrok-free.app"
START_PORT=3000
MAX_PORT=3010

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 1  # Port is in use
    else
        return 0  # Port is free
    fi
}

# Find available port
PORT=$START_PORT
while [ $PORT -le $MAX_PORT ]; do
    if check_port $PORT; then
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
echo "🚀 Starting ngrok tunnel on port $PORT with fixed URL..."
echo "🌐 Public URL: https://$NGROK_URL"
echo ""
echo "📝 Webhook Configuration:"
echo "   Clerk Endpoint: https://$NGROK_URL/api/webhooks/auth"
echo "   Stripe Endpoint: https://$NGROK_URL/api/webhooks/stripe"
echo ""
echo "⚙️  Don't forget to:"
echo "   1. Start your dev server on port $PORT"
echo "   2. Configure webhook signing secrets in Doppler"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Export the port for use by the dev server
export PORT=$PORT

ngrok http --url=$NGROK_URL $PORT
