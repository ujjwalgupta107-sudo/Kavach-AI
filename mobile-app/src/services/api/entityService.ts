import { apiClient } from './client';

export const entityService = {
  async getEntities() {
    return apiClient.get<any[]>('/api/v1/intelligence/entities');
  },
};
