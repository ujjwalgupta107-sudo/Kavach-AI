import { apiClient } from './client';

export const chatService = {
  async sendMessage(message: string) {
    return apiClient.post<{ reply: string }>('/api/v1/assistant/chat', { message });
  },
};
