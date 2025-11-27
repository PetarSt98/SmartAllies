# GitHub Copilot Instructions for SmartAllies Incident Reporting System

## Core Principles
Write code that prioritizes **human readability and maintainability** over cleverness. Every line should be self-explanatory to developers joining the project.

## ⚠️ Important: No Markdown Planning Documents
**Do not create markdown files for planning, notes, or tracking—work in memory instead.** Only create a markdown file when the user explicitly asks for that specific file by name or path.

---

## Code Style Guidelines

### 1. Naming Conventions
- **Be explicit over concise**: Use `userSubmittedIncidentReport` instead of `usrRpt`
- **Use domain language**: Match business terminology (e.g., `IncidentType`, `SamaritanAlert`, `FloorPlanLocation`)
- **Boolean naming**: Prefix with `is`, `has`, `should`, `can` (e.g., `isAnonymous`, `hasImage`)
- **Constants**: Use SCREAMING_SNAKE_CASE with descriptive names: `MAX_IMAGE_SIZE_MB`, `SWISS_EMERGENCY_NUMBER`

### 2. Function Design
```typescript
// ✅ GOOD: Single responsibility, clear purpose
function classifyIncidentType(message: string, imageUrl?: string): Promise<IncidentType> {
  // Implementation
}

// ❌ BAD: Multiple responsibilities, unclear
function processData(data: any): any {
  // Does too many things
}
```

**Rules:**
- One function = one responsibility
- Max 20 lines per function (extract if longer)
- Return types must always be explicit
- Use destructuring for clarity: `({ incidentId, userId })` 

### 3. Type Safety (TypeScript)
```typescript
// ✅ GOOD: Explicit types
interface IncidentReport {
  id: string;
  type: IncidentType;
  description: string;
  submittedAt: Date;
  isAnonymous: boolean;
  attachments?: ImageAttachment[];
}

// ❌ BAD: Using 'any'
function submitReport(data: any): any {
  // Loses type safety
}
```

**Rules:**
- Never use `any` (use `unknown` if type is truly unknown)
- Define interfaces for all data structures
- Use enums for fixed sets: `enum IncidentType { HUMAN, FACILITY, EMERGENCY }`
- Prefer `type` for unions: `type Status = 'pending' | 'submitted' | 'cancelled'`

### 4. Comments and Documentation
```typescript
/**
 * Sends emergency alert to company Samaritans with incident location.
 * 
 * @param location - GPS coordinates or floor plan position
 * @param personName - Name of person requiring assistance
 * @param condition - Current state/medical condition
 * @returns Promise resolving to alert confirmation ID
 * @throws {NetworkError} When Samaritan service is unreachable
 */
async function alertSamaritans(
  location: Location,
  personName: string,
  condition: string
): Promise<string> {
  // Implementation
}
```

**When to comment:**
- ✅ Complex business logic that isn't obvious
- ✅ Why a decision was made (not what the code does)
- ✅ Workarounds for known issues
- ❌ Don't explain obvious code: `// Loop through items`

### 5. Error Handling
```typescript
// ✅ GOOD: Specific error types with context
class IncidentClassificationError extends Error {
  constructor(message: string, public readonly userInput: string) {
    super(`Failed to classify incident: ${message}`);
    this.name = 'IncidentClassificationError';
  }
}

// Usage
try {
  const incidentType = await classifyIncident(userMessage);
} catch (error) {
  if (error instanceof IncidentClassificationError) {
    // Handle classification failure with context
    logger.error('Classification failed', { userInput: error.userInput });
  }
  throw error;
}
```

**Rules:**
- Create custom error classes for domain-specific failures
- Always include context in error messages
- Log errors with structured data (not just strings)
- Never swallow errors silently

---

## Architecture Patterns

### 6. Component Structure (React)
```typescript
// ✅ GOOD: Clear separation of concerns
interface IncidentChatProps {
  onIncidentSubmit: (report: IncidentReport) => Promise<void>;
  samaritanService: SamaritanService;
}

export function IncidentChat({ onIncidentSubmit, samaritanService }: IncidentChatProps) {
  // Component logic
}
```

**Rules:**
- Max 150 lines per component (split into smaller components if larger)
- Props must have explicit interface
- Extract business logic into custom hooks: `useIncidentClassification()`
- Keep JSX readable: extract complex conditional rendering into separate components

### 7. Custom Hooks Pattern
```typescript
// ✅ GOOD: Reusable, testable logic
function useIncidentWorkflow() {
  const [workflowState, setWorkflowState] = useState<WorkflowState>('initial');
  const [incidentType, setIncidentType] = useState<IncidentType | null>(null);

  const classifyIncident = useCallback(async (message: string) => {
    // Classification logic
  }, []);

  return {
    workflowState,
    incidentType,
    classifyIncident,
  };
}
```

### 8. Backend Service Layer (Java/Spring)
```java
// ✅ GOOD: Clear separation with interfaces
@Service
public class IncidentClassificationService {
    
    private final OllamaClient ollamaClient;
    private final ChromaDbRepository vectorStore;
    
    /**
     * Classifies incident type using LLM analysis.
     * 
     * @param userMessage The initial incident description
     * @param imageUrl Optional image for context
     * @return Classified incident type with confidence score
     */
    public IncidentClassification classifyIncident(
        String userMessage, 
        Optional<String> imageUrl
    ) {
        // Clear implementation steps
        String prompt = buildClassificationPrompt(userMessage, imageUrl);
        String llmResponse = ollamaClient.complete(prompt);
        return parseClassificationResponse(llmResponse);
    }
}
```

**Rules:**
- One service class per domain concept
- Use constructor injection (not field injection)
- Methods should be short and focused
- Use Optional<T> instead of null

---

## Configuration and Constants

### 9. Centralized Configuration
```typescript
// ✅ GOOD: config/constants.ts
export const INCIDENT_CONFIG = {
  CLASSIFICATION: {
    MAX_RETRIES: 3,
    CONFIDENCE_THRESHOLD: 0.75,
  },
  UPLOADS: {
    MAX_IMAGE_SIZE_MB: 10,
    ALLOWED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  },
  EMERGENCY: {
    SWISS_POLICE: '117',
    SWISS_AMBULANCE: '144',
    SWISS_FIRE: '118',
  },
} as const;

// ❌ BAD: Magic numbers scattered in code
if (fileSize > 10485760) { // What is this number?
  // ...
}
```

### 10. Environment Variables
```typescript
// ✅ GOOD: Validated configuration
import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_OLLAMA_MODEL: z.string().default('llama2'),
  VITE_MAX_MESSAGE_LENGTH: z.coerce.number().positive(),
});

export const env = envSchema.parse(import.meta.env);
```

---

## Testing Guidelines

### 11. Write Testable Code
```typescript
// ✅ GOOD: Dependencies injected, easy to mock
export function createIncidentService(
  llmClient: LLMClient,
  vectorDb: VectorDatabase
) {
  return {
    async classifyIncident(message: string) {
      // Testable implementation
    },
  };
}

// Test
const mockLLM = createMockLLMClient();
const service = createIncidentService(mockLLM, mockVectorDb);
```

**Rules:**
- Dependency injection over hard-coded dependencies
- Pure functions wherever possible
- Mock external services (Ollama, ChromaDB)
- Test file name: `ComponentName.test.tsx` or `ServiceName.test.ts`

### 12. Test Structure
```typescript
describe('IncidentClassificationService', () => {
  describe('classifyIncident', () => {
    it('should classify human incident when keywords match', async () => {
      // Arrange
      const message = "I'm feeling harassed by my colleague";
      const service = createTestService();
      
      // Act
      const result = await service.classifyIncident(message);
      
      // Assert
      expect(result.type).toBe(IncidentType.HUMAN);
      expect(result.confidence).toBeGreaterThan(0.75);
    });
  });
});
```

---

## File Organization

### 13. Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── incident/          # Incident-specific components
│   │   │   ├── IncidentChat.tsx
│   │   │   ├── IncidentTypeSelector.tsx
│   │   │   └── index.ts
│   │   ├── emergency/         # Emergency workflow
│   │   ├── ui/                # shadcn components
│   │   └── shared/            # Reusable components
│   ├── hooks/                 # Custom React hooks
│   │   ├── useIncidentWorkflow.ts
│   │   └── useVoiceRecording.ts
│   ├── services/              # API clients
│   │   ├── incidentApi.ts
│   │   └── ollamaClient.ts
│   ├── types/                 # TypeScript definitions
│   │   ├── incident.types.ts
│   │   └── api.types.ts
│   ├── utils/                 # Helper functions
│   ├── config/                # Constants and configuration
│   └── App.tsx

backend/
├── src/main/java/com/smartallies/
│   ├── incident/
│   │   ├── controller/        # REST endpoints
│   │   ├── service/           # Business logic
│   │   ├── repository/        # Data access
│   │   ├── model/             # Domain entities
│   │   └── dto/               # Data transfer objects
│   ├── llm/
│   │   ├── OllamaClient.java
│   │   ├── PromptBuilder.java
│   │   └── ResponseParser.java
│   └── config/                # Spring configuration
```

### 14. File Naming
- Components: PascalCase (`IncidentChat.tsx`)
- Hooks: camelCase with 'use' prefix (`useIncidentWorkflow.ts`)
- Services: camelCase with domain suffix (`incidentApi.ts`)
- Types: PascalCase with 'Type' or 'Interface' suffix (`IncidentType.ts`)
- Java: PascalCase with purpose suffix (`IncidentService.java`)

---

## Security and Data Handling

### 15. Sensitive Data
```typescript
// ✅ GOOD: Clear data sanitization
function sanitizeUserInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS vectors
    .slice(0, MAX_INPUT_LENGTH);
}

// ✅ GOOD: Anonymous submission handling
interface AnonymousReport extends Omit<IncidentReport, 'userId' | 'userName'> {
  isAnonymous: true;
}
```

**Rules:**
- Sanitize all user inputs before LLM processing
- Never log sensitive data (names, locations in emergency)
- Use environment variables for API keys
- Implement rate limiting on API endpoints

---

## LLM Integration Best Practices

### 16. Prompt Engineering
```typescript
// ✅ GOOD: Structured, versioned prompts
const PROMPTS = {
  CLASSIFICATION_V1: `
You are an incident classifier for a workplace safety system.
Analyze the following message and classify it as one of:
- HUMAN: harassment, discrimination, mental health, interpersonal conflicts
- FACILITY: equipment damage, maintenance issues, physical hazards
- EMERGENCY: immediate danger, medical emergency, fire, security threat

Message: {message}
Image context: {hasImage}

Respond in JSON format:
{
  "type": "HUMAN" | "FACILITY" | "EMERGENCY",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}
`,
} as const;

// Track prompt versions for debugging
function buildPrompt(template: string, variables: Record<string, any>) {
  return Object.entries(variables).reduce(
    (prompt, [key, value]) => prompt.replace(`{${key}}`, String(value)),
    template
  );
}
```

### 17. Response Parsing
```typescript
// ✅ GOOD: Robust parsing with validation
function parseClassificationResponse(llmOutput: string): IncidentClassification {
  try {
    const parsed = JSON.parse(llmOutput);
    
    // Validate structure
    if (!parsed.type || !VALID_INCIDENT_TYPES.includes(parsed.type)) {
      throw new Error(`Invalid incident type: ${parsed.type}`);
    }
    
    return {
      type: parsed.type,
      confidence: parsed.confidence ?? 0.5,
      reasoning: parsed.reasoning ?? 'No reasoning provided',
    };
  } catch (error) {
    logger.error('Failed to parse LLM response', { llmOutput, error });
    throw new IncidentClassificationError('Invalid LLM response format', llmOutput);
  }
}
```

---

## Performance and Optimization

### 18. Lazy Loading and Code Splitting
```typescript
// ✅ GOOD: Route-based code splitting
const HumanIncidentWorkflow = lazy(() => import('./workflows/HumanIncident'));
const FacilityIncidentWorkflow = lazy(() => import('./workflows/FacilityIncident'));
const EmergencyWorkflow = lazy(() => import('./workflows/Emergency'));
```

### 19. Memoization
```typescript
// ✅ GOOD: Memoize expensive computations
const processedFloorPlan = useMemo(
  () => generateFloorPlanGrid(floorPlanImage),
  [floorPlanImage]
);

// ✅ GOOD: Stable callback references
const handleSubmit = useCallback(
  async (report: IncidentReport) => {
    await submitIncident(report);
    resetWorkflow();
  },
  [submitIncident, resetWorkflow]
);
```

---

## Logging and Debugging

### 20. Structured Logging
```typescript
// ✅ GOOD: Contextual, structured logs
logger.info('Incident classified', {
  incidentId: report.id,
  type: classification.type,
  confidence: classification.confidence,
  duration: Date.now() - startTime,
});

// ❌ BAD: Unstructured logs
console.log('Incident classified: ' + classification.type);
```

**Java (Spring Boot):**
```java
@Slf4j
public class IncidentService {
    public void processIncident(IncidentDto incident) {
        log.info("Processing incident: id={}, type={}", 
            incident.getId(), 
            incident.getType()
        );
    }
}
```

---

## Git Commit Guidelines

### 21. Commit Messages
```
feat(incident): add human incident workflow with empathy resources
fix(emergency): correct Samaritan alert payload format
refactor(chat): extract message input into reusable component
docs(api): document incident classification endpoint
test(facility): add floor plan pin placement tests
```

**Format:** `type(scope): description`
- Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
- Keep first line under 72 characters
- Add detailed body for complex changes

---

## Review Checklist

Before submitting code, verify:
- [ ] All functions have explicit return types
- [ ] No `any` types used
- [ ] Error handling implemented with custom error types
- [ ] Complex logic has explanatory comments
- [ ] Magic numbers replaced with named constants
- [ ] Component < 150 lines (split if larger)
- [ ] Tests written for new functionality
- [ ] No console.log (use proper logger)
- [ ] Sensitive data not logged
- [ ] Types/interfaces exported from dedicated files

---

## Resources for New Developers

**Key Files to Read First:**
1. `types/incident.types.ts` - Core domain models
2. `config/constants.ts` - System configuration
3. `services/incidentApi.ts` - API integration
4. `backend/.../IncidentService.java` - Backend orchestration

**Development Workflow:**
1. Start Ollama locally: `ollama serve`
2. Start ChromaDB: `docker-compose up chromadb`
3. Backend: `./mvnw spring-boot:run`
4. Frontend: `npm run dev`

---

**Remember:** Code is read 10x more than it's written. Optimize for the next developer (which might be you in 6 months).
