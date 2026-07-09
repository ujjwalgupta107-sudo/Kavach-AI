import { apiClient } from './client';

export const caseService = {
  async submitCitizenReport(text: string) {
    return apiClient.post<any>('/api/v1/cases/', {
      description: text,
      source: 'MOBILE',
      status: 'OPEN',
    });
  },

  async getCaseDetail(caseId: string) {
    return apiClient.get<any>(`/api/v1/cases/${caseId}`);
  },

  async getCaseIntelligence(caseId: string) {
    return apiClient.get<any>(`/api/v1/cases/${caseId}/intelligence`);
  },

  async getSimilarCases(caseId: string) {
    return apiClient.get<any>(`/api/v1/intelligence/cases/${caseId}/similar`);
  },

  async getCases() {
    return apiClient.get<any>('/api/v1/cases/');
  },

  async getMyCases() {
    return apiClient.get<any>('/api/v1/cases/me');
  },
};
