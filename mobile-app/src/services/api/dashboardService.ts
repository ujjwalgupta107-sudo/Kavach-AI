import { apiClient } from './client';

export const dashboardService = {
  async getMetrics() {
    return apiClient.get<any>('/api/v1/dashboard/metrics');
  },

  async getCharts() {
    return apiClient.get<any>('/api/v1/dashboard/charts');
  },
};
