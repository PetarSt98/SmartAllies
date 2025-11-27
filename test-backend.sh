#!/bin/bash

# SmartAllies Incident Reporting Backend - Quick Start Guide
# This script will guide you through testing the backend

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   SmartAllies Incident Reporting Backend - Quick Start        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "ℹ️  Note: This project uses a remote Ollama host"
echo "   Make sure application.properties is configured correctly"
echo ""

# Check if backend is running
if ! curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
    echo "⚠️  Backend is not running!"
    echo ""
    echo "Starting backend now..."
    echo "This will take a few moments..."
    echo ""
    
    cd backend
    ./start.sh &
    BACKEND_PID=$!
    
    echo ""
    echo "⏳ Waiting for backend to start (this may take 30-60 seconds)..."
    
    for i in {1..60}; do
        if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
            echo ""
            echo "✅ Backend is running!"
            break
        fi
        sleep 2
        echo -n "."
    done
    
    cd ..
else
    echo "✅ Backend is already running at http://localhost:8080"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  Testing the API with example requests"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Test 1: Health Check
echo "📋 Test 1: Health Check"
echo "Request: GET /api/health"
echo ""
HEALTH_RESPONSE=$(curl -s http://localhost:8080/api/health)
echo "Response: $HEALTH_RESPONSE"
echo ""
sleep 2

# Test 2: Human Incident
echo "════════════════════════════════════════════════════════════════"
echo "📋 Test 2: Human Incident - Initial Report"
echo "Request: POST /api/chat"
echo "Message: 'I'm experiencing harassment from my colleague'"
echo ""

HUMAN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "demo-human-001",
    "message": "I am experiencing harassment from my colleague. They keep making inappropriate comments about my appearance."
  }')

echo "Response:"
echo "$HUMAN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$HUMAN_RESPONSE"
echo ""
sleep 2

# Test 3: Facility Incident
echo "════════════════════════════════════════════════════════════════"
echo "📋 Test 3: Facility Incident"
echo "Request: POST /api/chat"
echo "Message: 'The main conference room door is broken'"
echo ""

FACILITY_RESPONSE=$(curl -s -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "demo-facility-002",
    "message": "The door to the main conference room is broken and wont close properly. It is a safety hazard."
  }')

echo "Response:"
echo "$FACILITY_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$FACILITY_RESPONSE"
echo ""
sleep 2

# Test 4: Emergency
echo "════════════════════════════════════════════════════════════════"
echo "📋 Test 4: Emergency Situation"
echo "Request: POST /api/chat"
echo "Message: 'Someone collapsed! We need help immediately!'"
echo ""

EMERGENCY_RESPONSE=$(curl -s -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "demo-emergency-003",
    "message": "Someone collapsed in the office! We need help immediately! This is an emergency!"
  }')

echo "Response:"
echo "$EMERGENCY_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$EMERGENCY_RESPONSE"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "  Test Complete!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "✅ All three incident types have been tested"
echo ""
echo "📚 Next Steps:"
echo "   1. Import backend/postman_collection.json into Postman"
echo "   2. Try the complete workflows with multiple messages"
echo "   3. Check the logs for detailed LLM interactions"
echo "   4. Read BACKEND_IMPLEMENTATION.md for architecture details"
echo ""
echo "📖 Documentation:"
echo "   • README.md - Project overview"
echo "   • backend/README.md - Technical details"
echo "   • WORKFLOW_DIAGRAMS.md - Visual flows"
echo "   • IMPLEMENTATION_SUMMARY.md - What was built"
echo ""
echo "🎯 API Endpoint: http://localhost:8080/api/chat"
echo "🏥 Health Check: http://localhost:8080/api/health"
echo ""
echo "Happy testing! 🚀"
