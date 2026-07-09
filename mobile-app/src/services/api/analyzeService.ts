import { apiClient, API_BASE_URL } from './client';

export const analyzeService = {
  async analyzeText(text: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/public/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.detail || err?.error?.message || 'Analysis failed');
    }
    return response.json();
  },

  async analyzeImage(uri: string, fileName: string, mimeType: string) {
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: fileName,
      type: mimeType,
    } as any);

    const response = await fetch(`${API_BASE_URL}/api/v1/public/analyze-image`, {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (!response.ok) throw new Error('Image analysis failed');
    return response.json();
  },
};
