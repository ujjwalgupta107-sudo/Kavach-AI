import { apiClient, DATA_MODE } from './client';
import { analysisService as mockAnalysisService } from '../mock/analysisService';
import { caseService as mockCaseService } from '../mock/caseService';

export const caseService = {
  async submitCitizenReport(text: string) {
    if (DATA_MODE === 'demo') {
      return mockAnalysisService.analyzeText(text);
    }
    
    // API Mode
    const response = await apiClient.post<any>('/api/v1/cases/', {
      description: text,
      source: 'WEB',
      status: 'OPEN'
    });
    return response;
  },
  
  async getCaseDetail(caseId: string) {
    if (DATA_MODE === 'demo') {
      return mockCaseService.getCase(caseId);
    }
    
    // API Mode
    return apiClient.get<any>(`/api/v1/cases/${caseId}`);
  },

  async getCaseIntelligence(caseId: string) {
    if (DATA_MODE === 'demo') {
      return mockCaseService.getCase(caseId);
    }
    
    // API Mode
    return apiClient.get<any>(`/api/v1/cases/${caseId}/intelligence`);
  },

  async getSimilarCases(caseId: string) {
    if (DATA_MODE === 'demo') {
      return [];
    }
    return apiClient.get<any>(`/api/v1/intelligence/cases/${caseId}/similar`);
  },

  async getCases() {
    if (DATA_MODE === 'demo') {
      const cases = await mockCaseService.getCases();
      return { items: cases, total: cases.length };
    }
    
    // API Mode
    return apiClient.get<any>('/api/v1/cases/');
  },

  async getMyCases() {
    if (DATA_MODE === 'demo') {
      const cases = await mockCaseService.getCases();
      return { items: cases, total: cases.length };
    }
    
    // API Mode
    return apiClient.get<any>('/api/v1/cases/me');
  }
};
