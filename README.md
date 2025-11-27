# SmartAllies Incident Reporting System

AI-powered Progressive Web App for workplace incident reporting with three specialized workflows.

## 📁 Project Structure

```
SmartAllies/
├── .github/
│   └── copilot-instructions.md          # Code maintainability guidelines
├── backend/                             # ✅ COMPLETED
│   ├── src/main/java/                  # Spring Boot application
│   ├── pom.xml                         # Maven configuration
│   ├── docker-compose.yml              # Ollama setup
│   ├── start.sh                        # Quick start script
│   └── README.md                       # Backend documentation
├── frontend/                            # ⏳ TODO
│   └── (React + TypeScript PWA)
├── BACKEND_IMPLEMENTATION.md            # Detailed backend docs
└── README.md                           # This file
```

## 🎯 Project Goals

Build a chatbot that helps employees report three types of incidents:
1. **Human Incidents** - Harassment, discrimination, workplace conflicts
2. **Facility Incidents** - Equipment damage, maintenance issues
3. **Emergency Situations** - Medical emergencies, immediate dangers

## 🛠️ Tech Stack

### Backend (✅ Completed)
- **Java 17** with Spring Boot 3.2.0
- **Spring AI** for LLM integration
- **Ollama** (local LLM - llama3.2)
- **Maven** for build management

### Frontend (⏳ Planned)
- **React 18** with TypeScript
- **Vite** for build tooling
- **shadcn/ui** component library
- **PWA** configuration
- **Voice input** support
- **Image upload** capability

## 🚀 Quick Start

### Backend Setup

1. **Install Prerequisites:**
   ```bash
   # Java 17+
   brew install openjdk@17
   ```

2. **Configure Remote Ollama:**
   Edit `backend/src/main/resources/application.properties`:
   ```properties
   spring.ai.ollama.base-url=http://your-ollama-host:11434
   ```

3. **Start Backend:**
   ```bash
   cd backend
   ./start.sh
   ```
   
   This script will:
   - Check dependencies
   - Build and run Spring Boot app
   - Connect to remote Ollama host

4. **Test API:**
   ```bash
   curl http://localhost:8080/api/health
   ```

### Frontend Setup (Coming Soon)
```bash
cd frontend
npm install
npm run dev
```

## 📡 API Overview

### Main Endpoint: POST `/api/chat`

**Request:**
```json
{
  "sessionId": "unique-session-id",
  "message": "I want to report harassment",
  "imageUrl": "optional-image-url"
}
```

**Response:**
```json
{
  "message": "I understand this is a human incident...",
  "incidentType": "HUMAN",
  "workflowState": "AWAITING_CLASSIFICATION_CONFIRMATION",
  "suggestedActions": ["Yes", "No"],
  "resources": ["Employee Assistance Program: https://..."],
  "metadata": {
    "confidence": 0.95,
    "reasoning": "Keywords indicate workplace harassment"
  }
}
```

## 🔄 Workflow Overview

### 1. Initial Classification
```
User: "I'm experiencing harassment"
  ↓
LLM classifies as HUMAN incident
  ↓
Bot: "I understand this is a human incident. Is this correct?"
  ↓
User confirms → Proceed to workflow
```

### 2. Human Incident Workflow
```
Show empathetic resources
  ↓
Ask: "Would you like to draft a report?"
  ↓
Collect: Who, What, When, Where
  ↓
Generate professional summary
  ↓
Options: Submit | Submit Anonymously | Cancel
```

### 3. Facility Incident Workflow
```
Collect: What, Where (floor plan), Picture
  ↓
Generate maintenance summary
  ↓
Options: Submit | Submit Anonymously | Cancel
```

### 4. Emergency Workflow
```
🚨 IMMEDIATE ACTIVATION
  ↓
Display Swiss emergency numbers
  ↓
Collect location (MANDATORY)
  ↓
Alert company Samaritans
  ↓
Collect: Person name, Condition
  ↓
No submission - handled in real-time
```

## 📊 Current Status

### ✅ Completed
- [x] Backend architecture
- [x] Spring Boot setup with Spring AI
- [x] Ollama integration
- [x] Three workflow implementations
- [x] LLM prompt templates
- [x] Conversation state management
- [x] REST API endpoints
- [x] CORS configuration
- [x] Error handling
- [x] Logging
- [x] Documentation
- [x] Postman collection
- [x] Quick start script
- [x] Code maintainability guidelines

### ⏳ In Progress
- [ ] Frontend React application
- [ ] PWA configuration
- [ ] Voice input integration
- [ ] Image upload endpoint
- [ ] Floor plan component

### 🔮 Future Enhancements
- [ ] Database persistence (PostgreSQL)
- [ ] ChromaDB for RAG
- [ ] User authentication
- [ ] Real Samaritan alert system
- [ ] Report analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Email notifications
- [ ] Admin panel

## 🧪 Testing

### Test with Postman
Import `backend/postman_collection.json` for ready-made API calls:
- Health check
- Human incident flow
- Facility incident flow
- Emergency flow

### Test with cURL
```bash
# Human incident
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "message": "I want to report workplace harassment"
  }'

# Emergency
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "emergency-456",
    "message": "Someone collapsed! We need help!"
  }'
```

## 📖 Documentation

- **Backend Details:** `BACKEND_IMPLEMENTATION.md`
- **Backend Setup:** `backend/README.md`
- **Code Guidelines:** `.github/copilot-instructions.md`
- **API Examples:** `backend/postman_collection.json`

## 🏗️ Architecture Highlights

### Conversation State Machine
```
INITIAL → AWAITING_CLASSIFICATION_CONFIRMATION 
       → CLASSIFICATION_CONFIRMED 
       → COLLECTING_DETAILS 
       → REPORT_READY 
       → COMPLETED

(Emergency branch: EMERGENCY_ACTIVE)
```

### LLM Prompt Strategy
- **Versioned prompts** for each workflow step
- **Structured JSON outputs** for parsing
- **Context-aware** responses
- **Field extraction** from user messages

### Session Management
- In-memory conversation contexts
- Session-based state tracking
- Automatic field collection
- Context persistence across messages

## 🔐 Security Considerations

- CORS configured for frontend origins
- Input validation on all endpoints
- Structured logging (no sensitive data)
- Anonymous submission support
- Sanitization ready for user inputs

## 🌍 Localization

Swiss emergency numbers pre-configured:
- Police: **117**
- Ambulance: **144**
- Fire: **118**
- Samaritans: **143**

## 💡 Key Features

✨ **Smart Classification** - AI determines incident type automatically  
🤝 **Empathetic Responses** - Tone adapts to incident severity  
📋 **Guided Workflows** - Step-by-step data collection  
🚨 **Emergency Protocols** - Immediate activation for urgent cases  
🔒 **Anonymous Reporting** - Optional identity protection  
📚 **Resource Integration** - Context-aware help links  
📝 **Auto-Summarization** - Professional report generation  

## 👥 Development Team Guidelines

All developers should:
1. Read `.github/copilot-instructions.md` for coding standards
2. Follow single-responsibility principles
3. Use explicit types (no `any` in TypeScript)
4. Write self-documenting code
5. Include JSDoc/JavaDoc for complex logic
6. Test before committing

## 📞 Support

**Backend Issues:**
- Check remote Ollama host is accessible
- Test connection: `curl http://your-ollama-host:11434/api/tags`
- Verify base URL in application.properties
- Review logs: `tail -f logs/application.log`

**Common Issues:**
- Port 8080 in use: Change `server.port` in application.properties
- CORS errors: Add frontend URL to `cors.allowed-origins`
- Ollama connection: Check `spring.ai.ollama.base-url`

## 📜 License

Proprietary - SmartAllies © 2025

---

**Next Step:** Run the backend with `cd backend && ./start.sh` and test the API! 🚀
