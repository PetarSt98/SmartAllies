export enum IncidentType {
  HUMAN = 'HUMAN',
  FACILITY = 'FACILITY',
  EMERGENCY = 'EMERGENCY',
}

export enum WorkflowState {
  INITIAL = 'INITIAL',
  AWAITING_CLASSIFICATION_CONFIRMATION = 'AWAITING_CLASSIFICATION_CONFIRMATION',
  CLASSIFICATION_CONFIRMED = 'CLASSIFICATION_CONFIRMED',
  COLLECTING_DETAILS = 'COLLECTING_DETAILS',
  AWAITING_REPORT_CONFIRMATION = 'AWAITING_REPORT_CONFIRMATION',
  AWAITING_REPORTER_DETAILS = 'AWAITING_REPORTER_DETAILS',
  REPORT_READY = 'REPORT_READY',
  COMPLETED = 'COMPLETED',
  EMERGENCY_ACTIVE = 'EMERGENCY_ACTIVE',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  imageUrl?: string;
}

export interface ChatResponse {
  message: string;
  incidentType?: IncidentType;
  workflowState: WorkflowState;
  suggestedActions?: string[];
  resources?: string[];
  metadata?: Record<string, unknown>;
}

export interface FloorPlanPin {
  x: number;
  y: number;
  description?: string;
}
