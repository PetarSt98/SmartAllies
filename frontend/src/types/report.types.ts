export enum ReportStatus {
  SUBMITTED = 'SUBMITTED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  INVESTIGATION = 'INVESTIGATION',
  CLOSED = 'CLOSED',
}

export interface IncidentReport {
  reportId: string;
  incidentType: 'HUMAN' | 'FACILITY' | 'EMERGENCY';
  status: ReportStatus;
  description: string;
  details: Record<string, string>;
  imageUrl?: string;
  location?: string;
  submittedBy: string;
  anonymous: boolean;
  submittedAt: string;
  lastUpdated: string;
}

export interface SubmitReportRequest {
  sessionId: string;
  submittedBy?: string;
  anonymous: boolean;
  phoneNumber?: string;
}
