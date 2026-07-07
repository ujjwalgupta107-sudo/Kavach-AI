import axios from 'axios';
import { Platform } from 'react-native';

const FALLBACK_DEV_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
const FALLBACK_PROD_URL = 'https://api.kavach.ai';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? FALLBACK_DEV_URL : FALLBACK_PROD_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const kavachAPI = {
  // Public Analyze Endpoint (Replaces /call/analyze and /call/analyze-speech)
  analyzeSuspiciousText: async (text) => {
    const response = await api.post('/api/v1/public/analyze', { text });
    // Our backend returns { risk_score, risk_level, scam_type, explanation, red_flags, recommendations, ... }
    return response.data;
  },

  // Check Phone Reputation (Can use analyze endpoint as a fallback for now)
  checkPhoneReputation: async (phoneNumber) => {
    // For now we'll send it to analyze just to get a risk score if we don't have a dedicated phone check
    const response = await api.post('/api/v1/public/analyze', { text: `Phone number check: ${phoneNumber}` });
    return response.data;
  },

  // Report Incident
  submitIncidentReport: async (reportData) => {
    // Backend expects: scam_type, description, lat, lng, city
    const response = await api.post('/api/v1/public/report', reportData);
    return response.data;
  },

  // We will map Assistant here later
  askAssistant: async (message) => {
    const response = await api.post('/api/v1/public/assistant', { message });
    return response.data;
  },

  // Mock Graph Data for Investigator Dashboard so it doesn't crash if accessed
  getGraphMatrix: async () => {
    return { data: { nodes: [], links: [] } };
  },
  getLiveAlerts: async () => {
    return { data: [] };
  }
};

export default api;