import { apiClient } from './client';

export const graphService = {
  async getGraph() {
    return apiClient.get<any>('/api/v1/intelligence/graph');
  },
};
