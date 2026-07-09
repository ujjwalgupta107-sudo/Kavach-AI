import { apiClient } from './client';

export const alertService = {
  async getAlerts() {
    return apiClient.get<any>('/api/v1/alerts/');
  },
};
