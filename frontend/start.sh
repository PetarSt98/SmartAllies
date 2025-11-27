#!/bin/bash

echo "🚀 Starting SmartAllies Frontend..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if backend is running
if ! curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
    echo "⚠️  Warning: Backend is not running at http://localhost:8080"
    echo "   Please start the backend first with: cd ../backend && ./start.sh"
    echo ""
fi

echo "🌐 Starting development server..."
echo "   Frontend will be available at: http://localhost:5173"
echo "   API proxy: /api -> http://localhost:8080"
echo ""

npm run dev
