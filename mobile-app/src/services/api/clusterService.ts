import { apiClient } from './client';

export const clusterService = {
  async getClusters() {
    return apiClient.get<any>('/api/v1/clusters/');
  },

  async getClusterDetail(clusterId: string) {
    return apiClient.get<any>(`/api/v1/clusters/${clusterId}`);
  },
};
