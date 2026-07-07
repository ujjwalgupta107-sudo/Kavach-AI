import axios from 'axios';
import { Platform } from 'react-native';

// EXPO_PUBLIC_API_URL is the preferred way to configure the backend connection.
// Fallbacks provided for local development if the env var is not set.
const FALLBACK_DEV_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000/api/v1' : 'http://localhost:8000/api/v1';
const FALLBACK_PROD_URL = 'https://api.kavach.example.com/api/v1';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? FALLBACK_DEV_URL : FALLBACK_PROD_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const kavachAPI = {
  // 1. Live Call Stream Verification / Suspicious Message Analysis
  analyzeSuspiciousText: async (textChunk) => {
    // Calling the actual public Shield analysis endpoint
    const response = await api.post('/public/analyze', {
      text: textChunk,
    });
    return response.data;
  },

  // 2. Central Database Fraud Incident Report Submit
  submitIncidentReport: async (reportData) => {
    // Calling the actual citizen reporting/case creation endpoint
    const response = await api.post('/public/report', reportData);
    return response.data;
  },

  // 3. Graph Dashboard Data (Investigator)
  getDashboardMetrics: async () => {
    const response = await api.get('/dashboard/metrics');
    return response.data;
  },

  // 4. Live Alerts Polling
  getLiveAlerts: async () => {
    const response = await api.get('/alerts?status=NEW');
    return response.data;
  }
};

export default api;