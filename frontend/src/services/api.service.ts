import { APP_CONFIG } from '@/config/constants';
import type { ChatRequest, ChatResponse } from '@/types/incident.types';
import type { IncidentReport, SubmitReportRequest } from '@/types/report.types';

class ApiService {
  private baseUrl = APP_CONFIG.API_BASE_URL;

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
  }

  async submitReport(request: SubmitReportRequest): Promise<IncidentReport> {
    const response = await fetch(`${this.baseUrl}/reports/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Submit report error: ${response.statusText}`);
    }

    return response.json();
  }

  async getReport(reportId: string): Promise<IncidentReport> {
    const response = await fetch(`${this.baseUrl}/reports/${reportId}`);

    if (!response.ok) {
      throw new Error(`Get report error: ${response.statusText}`);
    }

    return response.json();
  }

  async checkHealth(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.text();
  }
}

export const apiService = new ApiService();
