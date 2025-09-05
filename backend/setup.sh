#!/bin/bash

echo "🚀 Setting up Hannah SMS Backend..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your API keys!"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install ngrok if not installed
if ! command -v ngrok &> /dev/null; then
    echo "📡 Installing ngrok for local testing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install ngrok
    else
        echo "Please install ngrok manually: https://ngrok.com/download"
    fi
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Run 'npm start' to start the webhook server"
echo "3. In another terminal, run 'npm run ngrok' to expose local server"
echo "4. Copy the ngrok HTTPS URL (e.g., https://abc123.ngrok.io)"
echo "5. Go to Twilio Console > Phone Numbers > +1 (551) 368-5291"
echo "6. Set webhook to: https://abc123.ngrok.io/sms-webhook"
echo "7. Text your Twilio number to test!"