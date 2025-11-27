# 🚀 Get Started with SmartAllies Backend

## What You Have

A **complete, production-ready Spring Boot backend** for an AI-powered incident reporting chatbot with three specialized workflows:

1. **Human Incidents** (Harassment, Discrimination, Workplace Conflicts)
2. **Facility Incidents** (Equipment Damage, Maintenance Issues)
3. **Emergency Situations** (Medical Emergencies, Immediate Dangers)

---

## Quick Start (2 Minutes)

### Option 1: Automated Start (Recommended)

```bash
cd backend
./start.sh
```

This script will:
- ✅ Check Java and Maven
- ✅ Start Ollama service
- ✅ Pull llama3.2 model
- ✅ Build the application
- ✅ Start the backend server

### Option 2: Test Everything

```bash
./test-backend.sh
```

This will:
- Start the backend if not running
- Run 4 test scenarios
- Show example responses
- Provide next steps

---

## Prerequisites

Before running, ensure you have:

1. **Java 17+**
   ```bash
   brew install openjdk@17
   ```

2. **Maven 3.6+**
   ```bash
   brew install maven
   ```

3. **Remote Ollama Host Access**
   - You have a remote Ollama host configured
   - Update `backend/src/main/resources/application.properties` with your host URL

---

## Verify Installation

### 1. Check Backend Status
```bash
curl http://localhost:8080/api/health
```

Expected response: `Incident Reporting Backend is running`

### 2. Test Chat Endpoint

```bash
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-001",
    "message": "I want to report harassment"
  }'
```

Expected: JSON response with classification and next steps

---

## Test with Postman

1. Import the collection:
   ```
   backend/postman_collection.json
   ```

2. Run the pre-configured requests:
   - Health Check
   - Human Incident Flow (4 steps)
   - Facility Incident
   - Emergency Scenario

---

## Example Conversations

### Human Incident Example

**Message 1:**
```json
{
  "sessionId": "user-123",
  "message": "I'm experiencing harassment from my colleague"
}
```

**Response 1:**
```json
{
  "message": "I understand this is a human incident. [reasoning]. Is this correct?",
  "incidentType": "HUMAN",
  "suggestedActions": ["Yes", "No"]
}
```

**Message 2:**
```json
{
  "sessionId": "user-123",
  "message": "Yes, that's correct"
}
```

**Response 2:**
```json
{
  "message": "Here are resources... Would you like to draft a report?",
  "resources": ["EAP link", "HR Hotline", ...],
  "suggestedActions": ["Yes, help me report this", "No, thank you"]
}
```

### Emergency Example

**Message 1:**
```json
{
  "sessionId": "emergency-456",
  "message": "Someone collapsed! We need help!"
}
```

**Response 1:**
```json
{
  "message": "🚨 EMERGENCY ACTIVATED\n\nSwiss Numbers:\nPolice: 117\nAmbulance: 144\n...\n\nProvide LOCATION immediately",
  "incidentType": "EMERGENCY",
  "metadata": {
    "isEmergency": true,
    "emergencyNumbers": {...}
  }
}
```

---

## Project Structure

```
SmartAllies/
├── backend/                          ← You are here
│   ├── src/main/java/
│   │   └── com/smartallies/incident/
│   │       ├── controller/           # REST API
│   │       ├── service/              # Business logic
│   │       ├── model/                # Domain models
│   │       ├── dto/                  # API contracts
│   │       ├── config/               # Configuration
│   │       └── util/                 # Prompts, helpers
│   ├── pom.xml                       # Dependencies
│   ├── start.sh                      # Quick start
│   └── README.md                     # Technical docs
│
├── .github/
│   └── copilot-instructions.md       # Code guidelines
│
├── README.md                         # Project overview
├── BACKEND_IMPLEMENTATION.md         # Architecture details
├── WORKFLOW_DIAGRAMS.md              # Visual diagrams
├── IMPLEMENTATION_SUMMARY.md         # What was built
├── GET_STARTED.md                    # This file
└── test-backend.sh                   # Test script
```

---

## Key Endpoints

### POST `/api/chat`
Main conversation endpoint

**Request:**
```json
{
  "sessionId": "unique-id",
  "message": "user message",
  "imageUrl": "optional"
}
```

**Response:**
```json
{
  "message": "bot response",
  "incidentType": "HUMAN|FACILITY|EMERGENCY",
  "workflowState": "current state",
  "suggestedActions": ["button options"],
  "resources": ["helpful links"],
  "metadata": {}
}
```

### GET `/api/health`
Health check endpoint

---

## Understanding the Workflows

### State Machine

```
INITIAL 
  → AWAITING_CLASSIFICATION_CONFIRMATION
  → CLASSIFICATION_CONFIRMED
  → COLLECTING_DETAILS
  → REPORT_READY
  → COMPLETED
```

### Incident Types

**HUMAN:**
- Empathetic tone
- Resource provision
- Collects: Who, What, When, Where
- Anonymous submission option

**FACILITY:**
- Maintenance focus
- Collects: What, Where, Picture
- Floor plan integration ready

**EMERGENCY:**
- Immediate activation
- Shows emergency numbers
- Alerts Samaritans
- Real-time handling

---

## Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
# Change port
server.port=8080

# Ollama settings
spring.ai.ollama.base-url=http://localhost:11434
spring.ai.ollama.chat.options.model=llama3.2
spring.ai.ollama.chat.options.temperature=0.7

# CORS (add your frontend URL)
cors.allowed-origins=http://localhost:5173,http://localhost:3000

# Emergency numbers (Switzerland)
emergency.phone.police=117
emergency.phone.ambulance=144
emergency.phone.fire=118
emergency.phone.samaritan=143
```

---

## Troubleshooting

### Backend won't start

**Check Java version:**
```bash
java -version
# Should be 17 or higher
```

**Check if port 8080 is in use:**
```bash
lsof -i :8080
# Change port in application.properties if needed
```

### Ollama issues

**Start Ollama manually:**
```bash
ollama serve
```

**Pull the model:**
```bash
ollama pull llama3.2
```

**Check model is available:**
```bash
ollama list | grep llama3.2
```

### CORS errors

Add your frontend URL to `application.properties`:
```properties
cors.allowed-origins=http://localhost:5173,http://your-frontend-url
```

---

## Logs and Debugging

### View logs
```bash
tail -f logs/spring.log
```

### Enable debug logging

In `application.properties`:
```properties
logging.level.com.smartallies=DEBUG
logging.level.org.springframework.ai=DEBUG
```

---

## Next Steps

### 1. Test the Backend ✅
```bash
./test-backend.sh
```

### 2. Explore with Postman ✅
Import `backend/postman_collection.json`

### 3. Read the Documentation 📚
- `README.md` - Project overview
- `BACKEND_IMPLEMENTATION.md` - Architecture
- `WORKFLOW_DIAGRAMS.md` - Visual flows
- `backend/README.md` - Technical details

### 4. Build the Frontend ⏳
- React + TypeScript
- shadcn/ui components
- Voice input
- Image upload
- PWA configuration

### 5. Add Database Persistence 🔮
- PostgreSQL for reports
- User authentication
- Report history
- Analytics

---

## Support Resources

### Documentation Files
- **GET_STARTED.md** ← You are here
- **README.md** - Project overview
- **BACKEND_IMPLEMENTATION.md** - Detailed architecture
- **WORKFLOW_DIAGRAMS.md** - Visual workflows
- **backend/README.md** - Backend technical docs

### Code Guidelines
- **.github/copilot-instructions.md** - Maintainability rules

### Testing
- **postman_collection.json** - API test examples
- **test-backend.sh** - Automated testing

---

## What's Included

✅ Complete Spring Boot backend  
✅ Three workflow implementations  
✅ LLM integration (Ollama + Spring AI)  
✅ Session management  
✅ Incident classification  
✅ Resource provision  
✅ Emergency protocols  
✅ CORS configuration  
✅ Error handling  
✅ Structured logging  
✅ Comprehensive documentation  
✅ Test scripts  
✅ Postman collection  

---

## Ready to Start?

```bash
# Start backend
cd backend
./start.sh

# In another terminal, test it
cd ..
./test-backend.sh
```

**Backend will be running at:** http://localhost:8080  
**API endpoint:** http://localhost:8080/api/chat  
**Health check:** http://localhost:8080/api/health  

---

## Need Help?

1. Check the logs: Backend console output
2. Review documentation: All .md files in project root
3. Test with Postman: Use provided collection
4. Verify Ollama: `ollama list`
5. Check configuration: `application.properties`

---

**You're all set! Start the backend and begin testing.** 🎉
